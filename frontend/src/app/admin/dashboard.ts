import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Icon } from '../shared/icon';
import { Reveal } from '../shared/reveal';

@Component({
  selector: 'sgu-dashboard',
  imports: [RouterLink, Icon, Reveal],
  template: `
    <div class="head">
      <span class="eyebrow">Administration</span>
      <h1>Good to see you</h1>
      <p class="muted">Signed in as {{ auth.user()?.email }}</p>
    </div>

    <div class="figures">
      @for (c of cards; track c.key; let i = $index) {
        <a class="figure" [routerLink]="c.link" sguReveal [revealDelay]="i * 0.05">
          <span class="figure__label"><sgu-icon [name]="c.icon" [size]="18" /> {{ c.label }}</span>
          <strong class="figure__value">
            @if (stats(); as s) { {{ s[c.key] }} } @else { <span class="skeleton" style="display: inline-block; width: 56px; height: 44px"></span> }
          </strong>
        </a>
      }
    </div>

    <h2>Quick actions</h2>
    <div class="actions">
      <a class="btn btn--primary" routerLink="/admin/news" [queryParams]="{ new: 1 }">Write a news article</a>
      <a class="btn btn--ghost" routerLink="/admin/events" [queryParams]="{ new: 1 }">Add an event</a>
      <a class="btn btn--ghost" routerLink="/admin/programmes" [queryParams]="{ new: 1 }">Add a programme</a>
    </div>
  `,
  styles: `
    .head { padding-bottom: 24px; border-bottom: 1px solid var(--line-strong); }
    h1 { font-size: clamp(2.2rem, 3.4vw, 2.8rem); margin-bottom: 6px; }
    .head p { margin: 0; }
    h2 { margin: 56px 0 20px; font-size: 1.7rem; }
    .figures { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(200px, 100%), 1fr)); margin: 0; border-bottom: 1px solid var(--line); }
    .figure { display: flex; flex-direction: column-reverse; justify-content: flex-end; gap: 10px; padding: 28px 24px 28px 0; text-decoration: none; color: var(--ink); border-right: 1px solid var(--line); }
    .figure + .figure { padding-left: 24px; }
    .figure:last-child { border-right: 0; }
    .figure__label { display: flex; align-items: center; gap: 8px; color: var(--ink-soft); font-size: .7rem; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; }
    .figure__label sgu-icon { color: var(--gold-deep); }
    .figure__value { font-family: var(--font-display); font-size: 3.2rem; font-weight: 600; color: var(--plum-900); line-height: 1; min-height: 44px; transition: color .15s var(--ease-out); }
    @media (hover: hover) and (pointer: fine) {
      .figure:hover .figure__value { color: var(--plum); }
    }
    .actions { display: flex; flex-wrap: wrap; gap: 12px; }
  `,
})
export class Dashboard {
  auth = inject(AuthService);
  stats = toSignal(inject(ApiService).stats().pipe(catchError(() => of(undefined))));

  readonly cards = [
    { key: 'news', label: 'News articles', icon: 'book', link: '/admin/news' },
    { key: 'upcomingEvents', label: 'Upcoming events', icon: 'calendar', link: '/admin/events' },
    { key: 'programmes', label: 'Programmes', icon: 'cap', link: '/admin/programmes' },
    { key: 'faculties', label: 'Faculties', icon: 'star', link: '/admin/faculties' },
    { key: 'unreadMessages', label: 'Unread messages', icon: 'mail', link: '/admin/messages' },
  ] as const;
}
