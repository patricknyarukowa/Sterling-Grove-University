import { Component, input } from '@angular/core';

// The university crest: an angular shield, a gold starburst and a silver leaf,
// with an optional wordmark beside it.
@Component({
  selector: 'sgu-crest',
  template: `
    <span class="crest" [class.crest--light]="light()">
      <svg viewBox="0 0 64 72" [attr.width]="size()" [attr.height]="size() * 1.125" aria-hidden="true">
        <path d="M32 2 60 12v24c0 17-12 28-28 34C16 64 4 53 4 36V12Z" fill="#4C1D95" stroke="#D4AF37" stroke-width="3" />
        <path d="M32 7 55 15v21c0 14-10 23-23 28C19 59 9 50 9 36V15Z" fill="none" stroke="#C9CED6" stroke-width=".8" opacity=".55" />
        <path d="M32 14 35 23 44 24 37 30 39 39 32 34 25 39 27 30 20 24 29 23Z" fill="#D4AF37" />
        <path d="M32 42c8 3 12 9 12 16-5-1-9-4-12-9-3 5-7 8-12 9 0-7 4-13 12-16Z" fill="#C9CED6" />
        <path d="M32 44v14" stroke="#4C1D95" stroke-width="1" />
      </svg>
      @if (wordmark()) {
        <span class="crest__text">
          <span class="crest__name">Sterling Grove</span>
          <span class="crest__sub">University</span>
        </span>
      }
    </span>
  `,
  styles: `
    .crest { display: inline-flex; align-items: center; gap: 12px; color: var(--plum-900); }
    .crest--light { color: #fff; }
    .crest__text { display: flex; flex-direction: column; line-height: 1; }
    .crest__name { font-family: var(--font-display); font-weight: 600; font-size: 1.6rem; letter-spacing: .01em; }
    .crest__sub { font-size: .62rem; font-weight: 600; letter-spacing: .46em; text-transform: uppercase; margin-top: 6px; color: var(--gold-deep); }
    .crest--light .crest__sub { color: var(--gold); }
  `,
})
export class Crest {
  size = input(40);
  wordmark = input(true);
  light = input(false);
}
