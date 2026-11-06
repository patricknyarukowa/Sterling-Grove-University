import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../core/api.service';
import { PageHero } from '../shared/page-hero';
import { Reveal } from '../shared/reveal';

// /events : the university diary, upcoming first, then an archive of past events
@Component({
  selector: 'sgu-events',
  imports: [DatePipe, PageHero, Reveal],
  template: `
    <sgu-page-hero eyebrow="Diary" title="Events at Sterling Grove" image="chapel-long"
      lead="Open days, public lectures, sport and ceremonies. Everyone is welcome." />

    <section class="section">
      <div class="container">
        <div class="section-head"><h2>Upcoming</h2></div>
        <ol class="diary">
          @for (e of upcoming(); track e.id; let i = $index) {
            <li sguReveal [revealDelay]="i * 0.05">
              <time class="diary__date" [attr.datetime]="e.startsAt">
                <span>{{ e.startsAt | date: 'MMM' }}</span>
                <strong>{{ e.startsAt | date: 'd' }}</strong>
                <span>{{ e.startsAt | date: 'EEEE' }}</span>
              </time>
              <div class="diary__body">
                <span class="tag">{{ e.category }}</span>
                <h3>{{ e.title }}</h3>
                <p>{{ e.description }}</p>
              </div>
              <dl class="diary__meta">
                <div><dt>Time</dt><dd>{{ e.startsAt | date: 'HH:mm' }}@if (e.endsAt) { to {{ e.endsAt | date: 'HH:mm' }}}</dd></div>
                <div><dt>Place</dt><dd>{{ e.location }}</dd></div>
              </dl>
            </li>
          } @empty {
            <li class="muted">No upcoming events right now. New dates are added each term.</li>
          }
        </ol>

        @if (past().length) {
          <div class="section-head past-head"><h2>Past events</h2></div>
          <ul class="past">
            @for (e of past(); track e.id) {
              <li><time [attr.datetime]="e.startsAt">{{ e.startsAt | date: 'd MMM y' }}</time> <strong>{{ e.title }}</strong> <span class="muted">{{ e.location }}</span></li>
            }
          </ul>
        }
      </div>
    </section>
  `,
  styles: `
    .diary { list-style: none; margin: 0; padding: 0; }
    .diary > li { display: grid; grid-template-columns: 140px minmax(0, 1fr) 240px; gap: clamp(24px, 4vw, 56px); padding: 36px 0; border-bottom: 1px solid var(--line); }
    .diary__date { display: flex; flex-direction: column; }
    .diary__date span { font-size: .7rem; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: var(--gold-deep); }
    .diary__date strong { font-family: var(--font-display); font-size: 4rem; font-weight: 600; line-height: 1; color: var(--plum-900); margin: 4px 0 6px; }
    .diary__body h3 { font-size: 1.8rem; margin: 8px 0 10px; }
    .diary__body p { color: var(--ink-soft); margin: 0; max-width: 60ch; }
    .diary__meta { margin: 0; }
    .diary__meta > div { padding: 10px 0; border-top: 1px solid var(--line); }
    dt { font-size: .68rem; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: var(--muted); }
    dd { margin: 4px 0 0; font-size: .95rem; }
    .past-head { margin-top: 96px; }
    .past { list-style: none; padding: 0; margin: 0; }
    .past li { display: flex; flex-wrap: wrap; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--line); }
    .past time { color: var(--gold-deep); font-weight: 600; min-width: 120px; }
    @media (max-width: 900px) {
      .diary > li { grid-template-columns: 96px minmax(0, 1fr); }
      .diary__meta { grid-column: 2; }
      .diary__date strong { font-size: 3rem; }
    }
  `,
})
export class Events {
  private all = toSignal(inject(ApiService).events().pipe(catchError(() => of([]))), { initialValue: [] });
  private now = Date.now();

  upcoming = computed(() =>
    this.all().filter(e => new Date(e.endsAt ?? e.startsAt).getTime() >= this.now)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt)));
  past = computed(() => this.all().filter(e => new Date(e.endsAt ?? e.startsAt).getTime() < this.now));
}
