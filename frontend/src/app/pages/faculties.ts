import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { ApiService } from '../core/api.service';
import { facultyImage, roman } from '../core/imagery';
import { PROGRAMME_LEVELS } from '../core/models';
import { PageHero } from '../shared/page-hero';
import { Reveal } from '../shared/reveal';

// /faculties : all faculties, set as a numbered index with a photograph for each
@Component({
  selector: 'sgu-faculties',
  imports: [RouterLink, PageHero, Reveal],
  template: `
    <sgu-page-hero eyebrow="Academics" title="Six faculties, one research precinct" image="quad-winter"
      lead="Every faculty shares labs, studios and seminar rooms, so no degree here is taught in isolation." />

    <section class="section">
      <div class="container">
        <ol class="index">
          @for (f of faculties(); track f.id; let i = $index) {
            <li sguReveal [revealDelay]="(i % 2) * 0.06">
              <a [routerLink]="['/faculties', f.slug]">
                <div class="index__photo photo">
                  <img [src]="'images/' + image(f.slug, i) + '-sm.jpg'" alt="" width="960" height="720" loading="lazy" />
                </div>
                <div class="index__body">
                  <span class="index__no">{{ numeral(i + 1) }}</span>
                  <h2>{{ f.name }}</h2>
                  <p>{{ f.description }}</p>
                </div>
                <span class="index__count">{{ f.programmeCount }} programmes</span>
              </a>
            </li>
          } @empty {
            @if (faculties()) {
              <li class="muted">No faculties are listed yet.</li>
            } @else {
              @for (i of [1, 2, 3]; track i) { <li><div class="skeleton" style="height: 180px; margin: 32px 0"></div></li> }
            }
          }
        </ol>
      </div>
    </section>
  `,
  styles: `
    .index { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--line-strong); }
    .index li { border-bottom: 1px solid var(--line-strong); }
    .index a { display: grid; grid-template-columns: 240px minmax(0, 1fr) auto; gap: clamp(24px, 4vw, 56px); align-items: center; padding: 32px 0; color: var(--ink); text-decoration: none; }
    .index__photo { aspect-ratio: 4 / 3; }
    .index__photo img { transition: transform .6s var(--ease-out); }
    .index__no { font-family: var(--font-display); font-size: 1.2rem; font-weight: 600; color: var(--gold-deep); }
    .index h2 { font-size: clamp(1.7rem, 2.6vw, 2.2rem); margin: 6px 0 10px; transition: color .15s var(--ease-out); }
    .index p { color: var(--ink-soft); margin: 0; max-width: 62ch; }
    .index__count { font-size: .7rem; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: var(--ink-soft); white-space: nowrap; }
    @media (hover: hover) and (pointer: fine) {
      .index a:hover img { transform: scale(1.04); }
      .index a:hover h2 { color: var(--plum); }
    }
    @media (max-width: 860px) {
      .index a { grid-template-columns: minmax(0, 1fr); }
      .index__photo { aspect-ratio: 16 / 9; }
    }
  `,
})
export class Faculties {
  faculties = toSignal(inject(ApiService).faculties().pipe(catchError(() => of([]))));
  readonly image = facultyImage;
  readonly numeral = roman;
}

// /faculties/:slug : one faculty and its programmes
@Component({
  selector: 'sgu-faculty-detail',
  imports: [RouterLink, PageHero, Reveal],
  template: `
    @if (detail(); as d) {
      <sgu-page-hero eyebrow="Faculty" [title]="d.faculty.name" [lead]="d.faculty.tagline" [image]="image(d.faculty.slug)" />
      <section class="section">
        <div class="container detail">
          <aside class="detail__about" sguReveal>
            <h2>About the faculty</h2>
            <p class="lead">{{ d.faculty.description }}</p>
            <dl class="detail__facts">
              <div><dt>Dean</dt><dd>{{ d.faculty.deanName }}</dd></div>
              <div><dt>Programmes</dt><dd>{{ d.programmes.length }}</dd></div>
            </dl>
            <a class="btn btn--ghost" routerLink="/programmes" [queryParams]="{ facultyId: d.faculty.id }">Search these programmes</a>
          </aside>

          <div>
            <h2 class="detail__title">Programmes</h2>
            <ul class="programmes">
              @for (p of d.programmes; track p.id; let i = $index) {
                <li sguReveal [revealDelay]="i * 0.06">
                  <span class="tag">{{ levelLabel(p.level) }}</span>
                  <h3>{{ p.title }}</h3>
                  <p>{{ p.summary }}</p>
                  <span class="programmes__meta">{{ p.code }} · {{ p.durationYears }} {{ p.durationYears === 1 ? 'year' : 'years' }}</span>
                </li>
              } @empty {
                <li class="muted">No programmes are listed for this faculty yet.</li>
              }
            </ul>
          </div>
        </div>
      </section>
    } @else if (detail() === null) {
      <sgu-page-hero eyebrow="Not found" title="We couldn't find that faculty" image="chapel-vault" />
      <section class="section"><div class="container"><a routerLink="/faculties" class="btn btn--primary">See all faculties</a></div></section>
    }
  `,
  styles: `
    .detail { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: clamp(40px, 6vw, 96px); align-items: start; }
    .detail__about { position: sticky; top: 140px; }
    .detail__facts { margin: 28px 0 32px; border-top: 1px solid var(--line); }
    .detail__facts > div { display: flex; justify-content: space-between; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--line); }
    dt { font-size: .7rem; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: var(--ink-soft); }
    dd { margin: 0; font-weight: 500; text-align: right; }
    .detail__title { padding-bottom: 20px; border-bottom: 1px solid var(--line-strong); margin-bottom: 0; }
    .programmes { list-style: none; margin: 0; padding: 0; }
    .programmes li { padding: 28px 0; border-bottom: 1px solid var(--line); }
    .programmes h3 { margin: 10px 0 8px; font-size: 1.6rem; }
    .programmes p { color: var(--ink-soft); margin-bottom: 10px; }
    .programmes__meta { font-size: .85rem; color: var(--muted); }
    @media (max-width: 900px) {
      .detail { grid-template-columns: minmax(0, 1fr); }
      .detail__about { position: static; }
    }
  `,
})
export class FacultyDetail {
  private api = inject(ApiService);
  slug = input.required<string>(); // filled from the :slug route parameter

  // undefined = loading, null = not found
  detail = toSignal(
    toObservable(this.slug).pipe(switchMap(slug => this.api.faculty(slug).pipe(catchError(() => of(null))))),
  );

  readonly image = facultyImage;

  levelLabel(level: string) { return PROGRAMME_LEVELS.find(l => l.value === level)?.label ?? level; }
}
