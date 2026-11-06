import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Crest } from '../shared/crest';

// A centred colophon: crest, founding line, then link rows set like an index.
@Component({
  selector: 'sgu-footer',
  imports: [RouterLink, Crest],
  template: `
    <footer class="footer on-dark">
      <div class="container">
        <div class="footer__mark">
          <sgu-crest [size]="64" [wordmark]="false" />
          <p class="footer__name">Sterling Grove University</p>
          <p class="footer__motto">Founded 1891 · Knowledge · Leadership · Legacy</p>
        </div>

        <dl class="footer__index">
          <div>
            <dt>Study</dt>
            <dd>
              <a routerLink="/programmes">All programmes</a>
              <a routerLink="/programmes" [queryParams]="{ level: 'Undergraduate' }">Undergraduate</a>
              <a routerLink="/programmes" [queryParams]="{ level: 'Masters' }">Postgraduate</a>
              <a routerLink="/programmes" [queryParams]="{ level: 'Online' }">Online learning</a>
            </dd>
          </div>
          <div>
            <dt>University</dt>
            <dd>
              <a routerLink="/about">About</a>
              <a routerLink="/faculties">Faculties</a>
              <a routerLink="/news">News</a>
              <a routerLink="/events">Events</a>
            </dd>
          </div>
          <div>
            <dt>Visit</dt>
            <dd>
              <span>1 Vanguard Avenue, Sterling Grove Campus</span>
              <a href="mailto:hello@sterlinggrove.edu">hello&#64;sterlinggrove.edu</a>
              <a routerLink="/contact">Write to us</a>
            </dd>
          </div>
        </dl>

        <div class="footer__bottom">
          <span>© {{ year }} Sterling Grove University. A fictional institution built as a learning project.</span>
          <nav aria-label="Staff">
            <a routerLink="/admin">Staff login</a>
          </nav>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .footer { background: var(--plum-900); color: #bfb5d9; padding: clamp(72px, 9vw, 112px) 0 0; }
    .footer__mark { text-align: center; display: flex; flex-direction: column; align-items: center; }
    .footer__name { font-family: var(--font-display); font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 600; color: #fff; margin: 20px 0 8px; }
    .footer__motto { color: var(--gold); letter-spacing: .24em; text-transform: uppercase; font-size: .68rem; font-weight: 600; margin: 0; }

    .footer__index { margin: clamp(48px, 6vw, 72px) 0 0; border-top: 1px solid rgba(255, 255, 255, .12); }
    .footer__index > div { display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: 24px; padding: 22px 0; border-bottom: 1px solid rgba(255, 255, 255, .12); }
    dt { color: #fff; font-size: .7rem; font-weight: 600; letter-spacing: .22em; text-transform: uppercase; padding-top: 4px; }
    dd { margin: 0; display: flex; flex-wrap: wrap; gap: 6px 32px; }
    dd a, dd span { color: #d6cee8; text-decoration: none; font-size: .98rem; white-space: nowrap; }
    dd a { transition: color .15s var(--ease-out); }
    dd a:hover { color: var(--gold); }

    .footer__bottom { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding: 26px 0 30px; font-size: .8rem; }
    .footer__bottom nav { display: flex; gap: 22px; }
    .footer__bottom a { color: #bfb5d9; text-decoration: none; }
    .footer__bottom a:hover { color: #fff; }

    @media (max-width: 640px) {
      .footer__index > div { grid-template-columns: 1fr; gap: 10px; }
      dd span { white-space: normal; }
    }
  `,
})
export class Footer {
  year = new Date().getFullYear();
}
