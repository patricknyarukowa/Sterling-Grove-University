import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Crest } from '../shared/crest';
import { Icon } from '../shared/icon';

@Component({
  selector: 'sgu-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Crest, Icon],
  template: `
    <div class="shell">
      <aside class="side on-dark" [class.side--open]="menuOpen()">
        <a routerLink="/admin" class="brand"><sgu-crest [size]="36" [light]="true" /></a>
        <span class="side__label">Administration</span>
        <nav (click)="menuOpen.set(false)">
          @for (item of nav; track item.link) {
            <a [routerLink]="item.link" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: item.link === '/admin' }">
              <sgu-icon [name]="item.icon" [size]="18" /> {{ item.label }}
            </a>
          }
        </nav>
        <div class="side__foot">
          <span class="side__user">{{ auth.user()?.email }}</span>
          <a routerLink="/" target="_blank">View website</a>
          <button type="button" (click)="auth.logout()">Sign out</button>
        </div>
      </aside>
      @if (menuOpen()) { <div class="scrim" (click)="menuOpen.set(false)"></div> }

      <div class="main">
        <header class="top">
          <button class="menu" type="button" (click)="menuOpen.set(!menuOpen())" [attr.aria-expanded]="menuOpen()" aria-label="Menu">
            <span></span><span></span>
          </button>
          <span class="top__title">Sterling Grove administration</span>
        </header>
        <div class="content"><router-outlet /></div>
      </div>
    </div>
  `,
  styles: `
    .shell { display: grid; grid-template-columns: 260px minmax(0, 1fr); min-height: 100dvh; background: var(--paper); }
    .side { background: var(--plum-900); color: #cfc6e4; display: flex; flex-direction: column; padding: 28px 18px; position: sticky; top: 0; height: 100dvh; }
    .brand { text-decoration: none; padding: 0 10px 24px; border-bottom: 1px solid rgba(255, 255, 255, .1); }
    .side__label { display: block; padding: 22px 12px 10px; font-size: .64rem; font-weight: 600; letter-spacing: .24em; text-transform: uppercase; color: var(--gold); }
    nav { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    nav a { display: flex; align-items: center; gap: 12px; min-height: 44px; padding: 0 12px; border-left: 2px solid transparent; color: #cfc6e4; text-decoration: none; font-size: .94rem;
      transition: background-color .15s var(--ease-out), color .15s var(--ease-out), border-color .15s var(--ease-out); }
    nav a:hover { background: rgba(255, 255, 255, .05); color: #fff; }
    nav a.active { border-left-color: var(--gold); background: rgba(255, 255, 255, .06); color: #fff; }
    .side__foot { display: flex; flex-direction: column; gap: 10px; font-size: .84rem; padding: 18px 12px 0; border-top: 1px solid rgba(255, 255, 255, .1); }
    .side__user { color: #fff; overflow-wrap: anywhere; }
    .side__foot a, .side__foot button { color: #cfc6e4; background: none; border: 0; padding: 0; text-align: left; font: inherit; cursor: pointer; text-decoration: none; }
    .side__foot a:hover, .side__foot button:hover { color: var(--gold); }
    .top { display: none; }
    .content { padding: clamp(24px, 4vw, 56px); max-width: 1240px; }
    .scrim { display: none; }

    @media (max-width: 900px) {
      .shell { grid-template-columns: minmax(0, 1fr); }
      .side { position: fixed; inset: 0 auto 0 0; width: 272px; z-index: 30; transform: translateX(-100%); transition: transform .25s var(--ease-out); }
      .side--open { transform: none; box-shadow: var(--shadow-lg); }
      .scrim { display: block; position: fixed; inset: 0; z-index: 29; background: rgba(34, 16, 61, .45); }
      .top { display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 0 12px; background: var(--surface); border-bottom: 1px solid var(--line); position: sticky; top: 0; z-index: 20; }
      .menu { width: 44px; height: 44px; padding: 14px 11px; background: none; border: 0; cursor: pointer; }
      .menu span { display: block; height: 1.5px; background: var(--plum-900); margin: 5px 0; }
      .top__title { font-family: var(--font-display); font-weight: 600; font-size: 1.15rem; color: var(--plum-900); }
    }
    @media (prefers-reduced-motion: reduce) {
      .side { transition-duration: .01ms; }
    }
  `,
})
export class AdminLayout {
  auth = inject(AuthService);
  menuOpen = signal(false);

  readonly nav = [
    { label: 'Dashboard', link: '/admin', icon: 'chart' },
    { label: 'News', link: '/admin/news', icon: 'book' },
    { label: 'Events', link: '/admin/events', icon: 'calendar' },
    { label: 'Programmes', link: '/admin/programmes', icon: 'cap' },
    { label: 'Faculties', link: '/admin/faculties', icon: 'star' },
    { label: 'Messages', link: '/admin/messages', icon: 'mail' },
  ];
}
