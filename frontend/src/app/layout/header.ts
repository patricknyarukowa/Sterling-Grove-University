import { Component, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { Crest } from '../shared/crest';
import { Icon } from '../shared/icon';

@Component({
  selector: 'sgu-header',
  imports: [RouterLink, RouterLinkActive, Crest, Icon],
  template: `
    <a class="skip" href="#main">Skip to main content</a>

    <div class="utility on-dark">
      <div class="container utility__inner">
        <span class="utility__motto">Knowledge · Leadership · Legacy</span>
        <nav aria-label="Audiences">
          <a routerLink="/programmes">Prospective students</a>
          <a routerLink="/news">Current students</a>
          <a routerLink="/about" fragment="alumni">Alumni</a>
          <a routerLink="/events">Visitors</a>
          <a routerLink="/admin">Staff login</a>
        </nav>
      </div>
    </div>

    <header class="header" [class.header--scrolled]="scrolled()">
      <div class="container header__inner">
        <a routerLink="/" class="header__brand" aria-label="Sterling Grove University home">
          <sgu-crest [size]="44" />
        </a>

        <nav class="nav" aria-label="Main">
          @for (item of nav; track item.link) {
            <a [routerLink]="item.link" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: item.link === '/' }">{{ item.label }}</a>
          }
        </nav>

        <div class="header__actions">
          <a routerLink="/programmes" class="icon-btn" aria-label="Search programmes"><sgu-icon name="search" [size]="20" /></a>
          <a routerLink="/programmes" class="btn btn--primary btn--sm header__apply">Apply for 2027</a>
          <button class="burger" type="button" (click)="open.set(!open())" [class.burger--open]="open()"
                  [attr.aria-expanded]="open()" aria-controls="mobile-menu" aria-label="Menu">
            <span></span><span></span>
          </button>
        </div>
      </div>
    </header>

    @if (open()) {
      <div class="drawer on-dark" id="mobile-menu">
        <nav aria-label="Mobile">
          @for (item of nav; track item.link) {
            <a [routerLink]="item.link" (click)="open.set(false)">{{ item.label }}</a>
          }
          <a routerLink="/admin" (click)="open.set(false)">Staff login</a>
        </nav>
        <a routerLink="/programmes" class="btn btn--gold" (click)="open.set(false)">Apply for 2027</a>
        <p class="drawer__motto">Knowledge · Leadership · Legacy</p>
      </div>
    }
  `,
  styles: `
    .skip { position: absolute; left: -9999px; top: 8px; z-index: 100; background: var(--plum); color: #fff; padding: 10px 16px; }
    .skip:focus { left: 8px; }

    .utility { background: var(--plum-900); color: #cfc6e4; }
    .utility__inner { display: flex; justify-content: space-between; align-items: center; min-height: 40px; gap: 16px; }
    .utility__motto { letter-spacing: .24em; text-transform: uppercase; color: var(--gold); font-weight: 600; font-size: .66rem; white-space: nowrap; }
    .utility nav { display: flex; gap: 26px; }
    .utility a { color: #cfc6e4; text-decoration: none; font-size: .7rem; letter-spacing: .14em; text-transform: uppercase; white-space: nowrap; transition: color .15s var(--ease-out); }
    .utility a:hover { color: #fff; }

    .header { position: sticky; top: 0; z-index: 50; background: rgba(250, 248, 243, .96); backdrop-filter: blur(10px); border-bottom: 1px solid var(--line); }
    .header--scrolled { border-bottom-color: var(--line-strong); box-shadow: 0 10px 30px -18px rgba(28, 23, 38, .3); }
    .header__inner { display: flex; align-items: center; gap: 32px; min-height: 92px; }
    .header__brand { text-decoration: none; flex-shrink: 0; }

    .nav { display: flex; gap: 2px; margin-left: auto; }
    .nav a { position: relative; padding: 10px 14px; color: var(--plum-900); text-decoration: none; font-family: var(--font-display); font-weight: 600; font-size: 1.16rem; white-space: nowrap; transition: color .15s var(--ease-out); }
    .nav a::after { content: ''; position: absolute; left: 14px; right: 14px; bottom: 4px; height: 1px; background: var(--gold-deep); opacity: 0; transform: scaleX(.4); transition: opacity .2s var(--ease-out), transform .2s var(--ease-out); }
    .nav a.active { color: var(--plum); }
    .nav a.active::after { opacity: 1; transform: none; }
    @media (hover: hover) and (pointer: fine) {
      .nav a:hover::after { opacity: 1; transform: none; }
    }

    .header__actions { display: flex; align-items: center; gap: 12px; }
    .icon-btn { display: grid; place-items: center; width: 44px; height: 44px; color: var(--plum-900); transition: background-color .15s var(--ease-out); }
    .icon-btn:hover { background: var(--surface-alt); }

    .burger { display: none; width: 44px; height: 44px; border: 0; background: none; cursor: pointer; padding: 12px 10px; }
    .burger span { display: block; height: 1.5px; background: var(--plum-900); margin: 6px 0; transition: transform .2s var(--ease-out); }
    .burger--open span:first-child { transform: translateY(3.75px) rotate(45deg); }
    .burger--open span:last-child { transform: translateY(-3.75px) rotate(-45deg); }

    .drawer { position: fixed; inset: 92px 0 0; z-index: 49; background: var(--plum-900); color: #fff; padding: 24px var(--gutter) 40px; display: flex; flex-direction: column; gap: 28px; overflow-y: auto; }
    .drawer nav { display: flex; flex-direction: column; }
    .drawer nav a { color: #fff; text-decoration: none; font-family: var(--font-display); font-size: 1.9rem; padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, .1); }
    .drawer__motto { color: var(--gold); letter-spacing: .24em; text-transform: uppercase; font-size: .68rem; }

    @media (max-width: 1140px) {
      .nav { display: none; }
      .burger { display: block; }
      .header__actions { margin-left: auto; }
    }
    @media (max-width: 760px) {
      .utility nav { display: none; }
      .utility__inner { justify-content: center; }
      .header__apply { display: none; }
      .header__inner { min-height: 76px; }
      .drawer { inset: 76px 0 0; }
    }
  `,
})
export class Header {
  readonly nav = [
    { label: 'Home', link: '/' },
    { label: 'About', link: '/about' },
    { label: 'Study', link: '/programmes' },
    { label: 'Faculties', link: '/faculties' },
    { label: 'News', link: '/news' },
    { label: 'Events', link: '/events' },
    { label: 'Contact', link: '/contact' },
  ];

  open = signal(false);
  scrolled = signal(false);

  constructor() {
    inject(Router).events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => this.open.set(false));
  }

  @HostListener('window:scroll')
  onScroll() { this.scrolled.set(window.scrollY > 8); }
}
