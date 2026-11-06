import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { roman } from '../core/imagery';
import { Crest } from '../shared/crest';
import { PageHero } from '../shared/page-hero';
import { Reveal } from '../shared/reveal';

@Component({
  selector: 'sgu-about',
  imports: [RouterLink, PageHero, Crest, Reveal],
  template: `
    <sgu-page-hero eyebrow="About Sterling Grove" title="Founded in 1891 around a shared laboratory" image="gothic-entrance"
      lead="The university opened with one building where every discipline worked under the same roof. The campus now has forty buildings, and the rule has not changed." />

    <section class="section">
      <div class="container mission">
        <div class="mission__text" sguReveal>
          <h2>Elite in standard, open in spirit</h2>
          <p class="lead">We hold our teaching and research to the highest standard, and we open that standard to every
            student with the talent and drive to meet it.</p>
          <p>The campus is organised around one research precinct, so engineers, scientists, lawyers, clinicians and
            artists work side by side. Students learn from people who are building the future, and are invited to help
            build it with them.</p>
        </div>
        <figure class="mission__photo" sguReveal [revealDelay]="0.1">
          <div class="photo"><img src="images/commencement-1920s-sm.jpg" width="960" height="778" loading="lazy"
               alt="A black and white photograph of graduates in gowns walking in procession across a lawn" /></div>
          <figcaption>Commencement procession, early twentieth century.</figcaption>
        </figure>
      </div>
    </section>

    <section class="section section--alt">
      <div class="container">
        <div class="section-head" sguReveal><h2>Knowledge · Leadership · Legacy</h2></div>
        <ol class="values">
          @for (v of values; track v.title; let i = $index) {
            <li sguReveal [revealDelay]="i * 0.08">
              <span class="values__no">{{ numeral(i + 1) }}</span>
              <h3>{{ v.title }}</h3>
              <p>{{ v.text }}</p>
            </li>
          }
        </ol>
      </div>
    </section>

    <section class="section section--dark" id="alumni">
      <div class="container identity">
        <div sguReveal>
          <span class="eyebrow">The Sterling Falcons</span>
          <h2>Fast, focused, far-sighted</h2>
          <p>The falcon is our mascot because it sees further than any other bird in the sky. Our athletes compete as the
            Falcons, and our alumni call themselves the Vanguard: the ones who go first.</p>
          <a class="btn btn--gold" routerLink="/contact">Join the alumni network</a>
        </div>
        <div class="identity__crest" sguReveal [revealDelay]="0.1">
          <sgu-crest [size]="120" [wordmark]="false" />
          <dl class="facts">
            <div><dt>Colours</dt><dd><i class="swatch swatch--steel"></i>Sterling Steel <i class="swatch swatch--plum"></i>Royal Violet <i class="swatch swatch--gold"></i>Champagne Gold</dd></div>
            <div><dt>Crest</dt><dd>An angular shield for rigour, a starburst for discovery, a silver leaf for growth</dd></div>
            <div><dt>Alumni society</dt><dd>The Vanguard</dd></div>
          </dl>
        </div>
      </div>
    </section>
  `,
  styles: `
    .mission { display: grid; grid-template-columns: minmax(0, 6fr) minmax(0, 5fr); gap: clamp(40px, 6vw, 96px); align-items: center; }
    .mission__photo { margin: 0; }
    .mission__photo .photo { aspect-ratio: 4 / 3; }
    figcaption { margin-top: 12px; font-size: .85rem; color: var(--muted); }

    .values { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(32px, 5vw, 64px); }
    .values li { border-top: 1px solid var(--line-strong); padding-top: 28px; }
    .values__no { font-family: var(--font-display); font-size: 1.3rem; font-weight: 600; color: var(--gold-deep); }
    .values h3 { font-size: 2rem; margin: 12px 0 14px; }
    .values p { color: var(--ink-soft); margin: 0; }

    .identity { display: grid; grid-template-columns: minmax(0, 6fr) minmax(0, 5fr); gap: clamp(40px, 6vw, 96px); align-items: center; }
    .identity p { color: #d9d0ea; max-width: 52ch; margin-bottom: 32px; }
    .identity__crest { display: flex; flex-direction: column; gap: 32px; align-items: flex-start; }
    .facts { margin: 0; width: 100%; border-top: 1px solid rgba(255, 255, 255, .14); }
    .facts > div { padding: 16px 0; border-bottom: 1px solid rgba(255, 255, 255, .14); }
    dt { color: var(--gold); font-size: .7rem; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; margin-bottom: 6px; }
    dd { margin: 0; color: #fff; display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
    .swatch { width: 12px; height: 12px; border: 1px solid rgba(255, 255, 255, .35); margin-left: 6px; }
    .swatch:first-child { margin-left: 0; }
    .swatch--steel { background: var(--steel); }
    .swatch--plum { background: var(--plum); }
    .swatch--gold { background: var(--gold); }

    @media (max-width: 900px) {
      .mission, .identity, .values { grid-template-columns: minmax(0, 1fr); }
    }
  `,
})
export class About {
  readonly numeral = roman;
  readonly values = [
    { title: 'Knowledge', text: 'We pursue understanding with rigour and share it generously, in lecture halls, in labs and in public.' },
    { title: 'Leadership', text: 'We develop people who take responsibility, make sound decisions and bring others with them.' },
    { title: 'Legacy', text: 'We measure success by what our graduates and our research leave behind for those who follow.' },
  ];
}
