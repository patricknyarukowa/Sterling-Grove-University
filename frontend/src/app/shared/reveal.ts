import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Fades an element up into place the first time it scrolls into view.
// Put it on each item of a list (with revealDelay = index * 0.06) to stagger them.
// With reduced motion the movement is dropped and only a short fade remains.
@Directive({ selector: '[sguReveal]' })
export class Reveal {
  revealDelay = input(0);

  constructor() {
    const el: HTMLElement = inject(ElementRef).nativeElement;
    let mm: gsap.MatchMedia | undefined;

    afterNextRender(() => {
      mm = gsap.matchMedia();
      mm.add({ full: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' }, ctx => {
        const trigger = { trigger: el, start: 'top 90%', once: true };
        if (ctx.conditions?.['reduced']) {
          gsap.from(el, { opacity: 0, duration: 0.15, scrollTrigger: trigger });
        } else {
          gsap.from(el, { opacity: 0, y: 28, duration: 0.9, ease: 'expo.out', delay: this.revealDelay(), scrollTrigger: trigger });
        }
      });
    });

    inject(DestroyRef).onDestroy(() => mm?.revert());
  }
}
