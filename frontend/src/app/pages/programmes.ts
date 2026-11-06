import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, debounceTime, of, switchMap, tap } from 'rxjs';
import { ApiService } from '../core/api.service';
import { PROGRAMME_LEVELS, ProgrammeLevel } from '../core/models';
import { PageHero } from '../shared/page-hero';
import { Reveal } from '../shared/reveal';

// /programmes?q=&level=&facultyId= : search and filter all programmes
@Component({
  selector: 'sgu-programmes',
  imports: [FormsModule, RouterLink, PageHero, Reveal],
  template: `
    <sgu-page-hero eyebrow="Study at Sterling Grove" title="Find your programme" image="hall-georgian"
      lead="Undergraduate, postgraduate, online and short courses across six faculties." />

    <section class="section">
      <div class="container">
        <form class="filters" (ngSubmit)="apply()">
          <div class="field">
            <label for="q">Keyword</label>
            <input id="q" name="q" placeholder="Data, law, engineering" [(ngModel)]="form.q" (ngModelChange)="apply()" />
          </div>
          <div class="field">
            <label for="level">Level</label>
            <select id="level" name="level" [(ngModel)]="form.level" (ngModelChange)="apply()">
              <option value="">All levels</option>
              @for (l of levels; track l.value) { <option [value]="l.value">{{ l.label }}</option> }
            </select>
          </div>
          <div class="field">
            <label for="faculty">Faculty</label>
            <select id="faculty" name="faculty" [(ngModel)]="form.facultyId" (ngModelChange)="apply()">
              <option [ngValue]="null">All faculties</option>
              @for (f of faculties(); track f.id) { <option [ngValue]="f.id">{{ f.name }}</option> }
            </select>
          </div>
        </form>

        <p class="count" aria-live="polite">
          @if (loading()) { Searching programmes } @else { <strong>{{ results().length }}</strong> {{ results().length === 1 ? 'programme' : 'programmes' }} found }
        </p>

        <div class="grid grid--3" [class.is-loading]="loading()">
          @if (loading() && !results().length) {
            @for (i of [1, 2, 3]; track i) { <div class="skeleton" style="height: 320px"></div> }
          }
          @for (p of results(); track p.id; let i = $index) {
            <article class="card programme" sguReveal [revealDelay]="(i % 3) * 0.05">
              <div class="programme__top">
                <span class="tag" [class.tag--gold]="p.level === 'Online' || p.level === 'ShortCourse'">{{ levelLabel(p.level) }}</span>
                <span class="programme__code">{{ p.code }}</span>
              </div>
              <h3>{{ p.title }}</h3>
              <p>{{ p.summary }}</p>
              <dl>
                <div><dt>Duration</dt><dd>{{ p.durationYears }} {{ p.durationYears === 1 ? 'year' : 'years' }}</dd></div>
                <div><dt>Faculty</dt><dd><a [routerLink]="['/faculties', p.facultySlug]">{{ p.facultyName }}</a></dd></div>
              </dl>
              <details>
                <summary>Admission requirements</summary>
                <p>{{ p.admissionRequirements }}</p>
              </details>
            </article>
          } @empty {
            @if (!loading()) {
              <div class="empty">
                <h3>No programmes match your search</h3>
                <p>Try a broader keyword, or clear the level and faculty filters.</p>
                <button class="btn btn--ghost" type="button" (click)="reset()">Clear filters</button>
              </div>
            }
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .filters { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1.4fr); gap: 24px; padding: 28px 0; border-top: 1px solid var(--line-strong); border-bottom: 1px solid var(--line-strong); }
    .filters .field { margin: 0; }
    .count { margin: 28px 0 32px; color: var(--muted); }
    .count strong { color: var(--plum-900); font-family: var(--font-display); font-size: 1.5rem; margin-right: 4px; }
    .is-loading .programme { opacity: .55; transition: opacity .15s var(--ease-out); }
    .programme { padding: 32px; display: flex; flex-direction: column; border-top: 2px solid var(--plum); }
    .programme__top { display: flex; justify-content: space-between; align-items: center; }
    .programme__code { font-size: .74rem; font-weight: 600; letter-spacing: .12em; color: var(--muted); }
    .programme h3 { margin: 16px 0 10px; font-size: 1.6rem; }
    .programme > p { color: var(--ink-soft); flex: 1; }
    dl { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr); gap: 12px; margin: 8px 0 18px; padding: 16px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
    dt { font-size: .68rem; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); }
    dd { margin: 4px 0 0; font-size: .92rem; }
    summary { cursor: pointer; font-size: .72rem; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: var(--plum); min-height: 32px; display: flex; align-items: center; }
    details p { margin: 10px 0 0; font-size: .92rem; color: var(--ink-soft); }
    .empty { grid-column: 1 / -1; text-align: center; padding: 64px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
    .empty p { color: var(--muted); }
    @media (max-width: 760px) { .filters { grid-template-columns: minmax(0, 1fr); } }
  `,
})
export class Programmes {
  private api = inject(ApiService);
  private router = inject(Router);

  // Query-string values arrive as inputs thanks to withComponentInputBinding()
  q = input<string>();
  level = input<ProgrammeLevel | ''>();
  facultyId = input<string>();

  readonly levels = PROGRAMME_LEVELS;
  faculties = toSignal(this.api.faculties().pipe(catchError(() => of([]))), { initialValue: [] });

  form = { q: '', level: '' as ProgrammeLevel | '', facultyId: null as number | null };
  loading = signal(true);

  private filter = computed(() => ({
    q: this.q() ?? '',
    level: this.level() ?? '',
    facultyId: this.facultyId() ? Number(this.facultyId()) : null,
  }));

  results = toSignal(
    toObservable(this.filter).pipe(
      tap(f => { this.form = { ...f }; this.loading.set(true); }),
      debounceTime(150),
      switchMap(f => this.api.programmes(f).pipe(catchError(() => of([])))), // e.g. ?level=nonsense
      tap(() => this.loading.set(false)),
    ),
    { initialValue: [] },
  );

  // Writes the form into the URL; the URL then drives the search above
  apply() {
    this.router.navigate([], {
      queryParams: { q: this.form.q || null, level: this.form.level || null, facultyId: this.form.facultyId },
      replaceUrl: true,
    });
  }

  reset() {
    this.form = { q: '', level: '', facultyId: null };
    this.apply();
  }

  levelLabel(level: string) { return this.levels.find(l => l.value === level)?.label ?? level; }
}
