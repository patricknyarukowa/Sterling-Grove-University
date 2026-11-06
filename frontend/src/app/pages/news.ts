import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { ApiService } from '../core/api.service';
import { newsImage } from '../core/imagery';
import { PageHero } from '../shared/page-hero';
import { Reveal } from '../shared/reveal';

// /news?category=&page= : paged news list with a category filter
@Component({
  selector: 'sgu-news',
  imports: [RouterLink, DatePipe, PageHero, Reveal],
  template: `
    <sgu-page-hero eyebrow="Newsroom" title="News from Sterling Grove" image="chapel-vault"
      lead="Research results, student achievements and announcements from across the university." />

    <section class="section">
      <div class="container">
        <nav class="tabs" aria-label="Categories">
          <a routerLink="/news" [class.active]="!category()" [attr.aria-current]="!category() ? 'page' : null">All</a>
          @for (c of categories(); track c) {
            <a routerLink="/news" [queryParams]="{ category: c }" [class.active]="category() === c" [attr.aria-current]="category() === c ? 'page' : null">{{ c }}</a>
          }
        </nav>

        <div class="grid grid--3">
          @for (n of result()?.items; track n.id; let i = $index) {
            <a class="article" [routerLink]="['/news', n.slug]" sguReveal [revealDelay]="(i % 3) * 0.06">
              <div class="article__photo photo">
                <img [src]="'images/' + image(n.category) + '-sm.jpg'" alt="" width="960" height="640" loading="lazy" />
              </div>
              <span class="tag">{{ n.category }}</span>
              <h2>{{ n.title }}</h2>
              <p>{{ n.summary }}</p>
              <time [attr.datetime]="n.publishedAt">{{ n.publishedAt | date: 'd MMMM y' }}</time>
            </a>
          } @empty {
            @if (result()) {
              <p class="muted empty">No articles in this category yet.</p>
            } @else {
              @for (i of [1, 2, 3]; track i) { <div class="skeleton" style="height: 420px"></div> }
            }
          }
        </div>

        @if (result(); as r) {
          @if (r.totalPages > 1) {
            <nav class="pager" aria-label="Pages">
              @for (p of pages(); track p) {
                <a routerLink="/news" [queryParams]="{ category: category() || null, page: p }" [class.active]="p === r.page" [attr.aria-current]="p === r.page ? 'page' : null">{{ p }}</a>
              }
            </nav>
          }
        }
      </div>
    </section>
  `,
  styles: `
    .tabs { display: flex; flex-wrap: wrap; gap: 4px 28px; margin-bottom: 48px; border-bottom: 1px solid var(--line-strong); }
    .tabs a { padding: 12px 0; margin-bottom: -1px; border-bottom: 2px solid transparent; text-decoration: none; color: var(--ink-soft); font-size: .74rem; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; white-space: nowrap; transition: color .15s var(--ease-out), border-color .15s var(--ease-out); }
    .tabs a:hover { color: var(--plum); }
    .tabs a.active { color: var(--plum-900); border-bottom-color: var(--gold-deep); }
    .grid { row-gap: 56px; }
    .article { text-decoration: none; color: var(--ink); display: flex; flex-direction: column; }
    .article__photo { aspect-ratio: 3 / 2; margin-bottom: 20px; }
    .article__photo img { transition: transform .6s var(--ease-out); }
    .article h2 { font-size: 1.6rem; margin: 10px 0 10px; transition: color .15s var(--ease-out); }
    .article p { color: var(--ink-soft); margin: 0 0 14px; flex: 1; }
    .article time { font-size: .85rem; color: var(--muted); }
    @media (hover: hover) and (pointer: fine) {
      .article:hover img { transform: scale(1.03); }
      .article:hover h2 { color: var(--plum); }
    }
    .empty { grid-column: 1 / -1; }
    .pager { display: flex; justify-content: center; gap: 6px; margin-top: 64px; }
    .pager a { width: 44px; height: 44px; display: grid; place-items: center; border: 1px solid var(--line-strong); text-decoration: none; color: var(--ink); font-variant-numeric: lining-nums; }
    .pager a:hover { border-color: var(--plum); }
    .pager a.active { background: var(--plum); color: #fff; border-color: var(--plum); }
  `,
})
export class News {
  private api = inject(ApiService);
  category = input<string>();
  page = input<string>();

  categories = toSignal(this.api.newsCategories().pipe(catchError(() => of([]))), { initialValue: [] });
  private query = computed(() => ({ category: this.category() ?? '', page: Number(this.page() ?? 1) || 1, pageSize: 9 }));
  result = toSignal(toObservable(this.query).pipe(switchMap(q => this.api.news(q).pipe(
    catchError(() => of({ items: [], page: 1, pageSize: q.pageSize, totalCount: 0, totalPages: 0 }))))));
  pages = computed(() => Array.from({ length: this.result()?.totalPages ?? 0 }, (_, i) => i + 1));

  readonly image = newsImage;
}

// /news/:slug : one article, set like a printed feature
@Component({
  selector: 'sgu-news-detail',
  imports: [RouterLink, DatePipe],
  template: `
    @if (article(); as a) {
      <article>
        <header class="container narrow head">
          <a routerLink="/news" class="back link-arrow">All news</a>
          <span class="tag">{{ a.category }}</span>
          <h1>{{ a.title }}</h1>
          <p class="meta">By {{ a.author }} · <time [attr.datetime]="a.publishedAt">{{ a.publishedAt | date: 'd MMMM y' }}</time></p>
        </header>
        <div class="container">
          <div class="figure photo">
            <img [src]="'images/' + image(a.category) + '.jpg'" alt="" width="1920" height="1280" fetchpriority="high" />
          </div>
        </div>
        <div class="container narrow body">
          <p class="lead">{{ a.summary }}</p>
          @for (para of body(); track $index; let first = $first) { <p [class.dropcap]="first">{{ para }}</p> }
          <hr class="rule" />
          <a routerLink="/news" class="link-arrow">More from the newsroom</a>
        </div>
      </article>
    } @else if (article() === null) {
      <div class="container narrow head">
        <h1>Article not found</h1>
        <p class="muted">It may have been moved or unpublished.</p>
        <a routerLink="/news" class="btn btn--primary">Back to news</a>
      </div>
    } @else {
      <div class="container narrow head">
        <div class="skeleton" style="height: 24px; width: 120px; margin-bottom: 24px"></div>
        <div class="skeleton" style="height: 120px"></div>
      </div>
    }
  `,
  styles: `
    .narrow { max-width: 820px; }
    .head { padding-top: clamp(56px, 7vw, 96px); padding-bottom: 40px; }
    .back { display: flex; width: fit-content; margin-bottom: 40px; flex-direction: row-reverse; }
    .back::after { content: '←'; }
    .head h1 { margin: 14px 0 18px; font-size: clamp(2.4rem, 4.6vw, 3.8rem); }
    .meta { color: var(--muted); margin: 0; }
    .figure { aspect-ratio: 21 / 9; }
    .body { padding-top: 56px; padding-bottom: clamp(80px, 10vw, 128px); font-size: 1.12rem; line-height: 1.75; }
    .body .lead { font-family: var(--font-display); font-size: 1.6rem; line-height: 1.4; color: var(--plum-900); margin-bottom: 1.4em; }
    .dropcap::first-letter { float: left; font-family: var(--font-display); font-weight: 600; font-size: 4.4em; line-height: .82; margin: .06em .1em 0 0; color: var(--plum); }
    .rule { margin: 56px 0 32px; }
    @media (max-width: 640px) { .figure { aspect-ratio: 4 / 3; } }
  `,
})
export class NewsDetail {
  private api = inject(ApiService);
  slug = input.required<string>();

  article = toSignal(toObservable(this.slug).pipe(switchMap(s => this.api.article(s).pipe(catchError(() => of(null))))));
  paragraphs = computed(() => (this.article()?.body ?? '').split(/\n{2,}/).filter(p => p.trim()));
  // The summary is already shown as the standfirst, so skip it if the body repeats it word for word
  body = computed(() => {
    const [first, ...rest] = this.paragraphs();
    return first?.trim() === this.article()?.summary.trim() ? rest : this.paragraphs();
  });

  readonly image = newsImage;
}
