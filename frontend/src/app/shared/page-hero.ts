import { Component, input } from '@angular/core';

// The photographic banner at the top of inner pages (About, News, Faculties...).
// `image` is a file name in public/images without the extension, e.g. 'gothic-entrance'.
@Component({
  selector: 'sgu-page-hero',
  template: `
    <section class="hero on-dark">
      <div class="hero__photo photo" aria-hidden="true">
        @if (image()) {
          <img [src]="'images/' + image() + '.jpg'" alt="" width="1920" height="1280" fetchpriority="high" />
        }
      </div>
      <div class="container hero__inner">
        @if (eyebrow()) { <span class="eyebrow">{{ eyebrow() }}</span> }
        <h1>{{ title() }}</h1>
        @if (lead()) { <p>{{ lead() }}</p> }
        <ng-content />
      </div>
    </section>
  `,
  styles: `
    .hero { position: relative; color: #ece6f6; background: var(--plum-900); isolation: isolate; }
    .hero__photo { position: absolute; inset: 0; z-index: -1; }
    .hero__photo::before { content: ''; position: absolute; inset: 0; z-index: 1;
      background: linear-gradient(90deg, rgba(34, 16, 61, .92) 0%, rgba(34, 16, 61, .72) 45%, rgba(34, 16, 61, .25) 100%); }
    .hero__inner { min-height: clamp(340px, 42vw, 480px); display: flex; flex-direction: column; justify-content: flex-end; padding-top: 96px; padding-bottom: clamp(48px, 6vw, 80px); }
    .eyebrow { color: var(--gold); }
    h1 { color: #fff; max-width: 22ch; margin-bottom: 18px; text-wrap: balance; }
    p { font-size: 1.18rem; line-height: 1.55; max-width: 58ch; margin: 0; color: #e2dbef; }
  `,
})
export class PageHero {
  eyebrow = input('');
  title = input.required<string>();
  lead = input('');
  image = input('');
}
