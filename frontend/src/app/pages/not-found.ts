import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHero } from '../shared/page-hero';

@Component({
  selector: 'sgu-not-found',
  imports: [RouterLink, PageHero],
  template: `
    <sgu-page-hero eyebrow="Page not found" title="This page has flown the nest" image="quad-winter"
      lead="The page you're looking for doesn't exist or has moved.">
      <div class="actions">
        <a routerLink="/" class="btn btn--gold">Back to the home page</a>
        <a routerLink="/programmes" class="btn btn--light">Find a programme</a>
      </div>
    </sgu-page-hero>
  `,
  styles: `.actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 32px; }`,
})
export class NotFound {}
