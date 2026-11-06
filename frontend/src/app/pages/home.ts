import { DatePipe } from '@angular/common';
import { Component, DestroyRef, ElementRef, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { catchError, map, of } from 'rxjs';
import { ApiService } from '../core/api.service';
import { newsImage, roman } from '../core/imagery';
import { Icon } from '../shared/icon';
import { Reveal } from '../shared/reveal';

@Component({
  selector: 'sgu-home',
  imports: [RouterLink, FormsModule, DatePipe, Icon, Reveal],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private api = inject(ApiService);
  private router = inject(Router);

  // toSignal subscribes to the HTTP call and exposes the result as a signal.
  // A signal throws when read if its call failed, so a failed call becomes an empty list.
  featured = toSignal(this.api.news({ featured: true, pageSize: 1 }).pipe(map(r => r.items), catchError(() => of([]))), { initialValue: [] });
  latest = toSignal(this.api.news({ pageSize: 4 }).pipe(map(r => r.items), catchError(() => of([]))), { initialValue: [] });
  events = toSignal(this.api.events(true, 4).pipe(catchError(() => of([]))), { initialValue: [] });
  faculties = toSignal(this.api.faculties().pipe(catchError(() => of([]))), { initialValue: [] });
  testimonials = toSignal(this.api.testimonials().pipe(catchError(() => of([]))), { initialValue: [] });

  // The lead story is the newest featured article; the list beside it is the latest three others
  lead = computed(() => this.featured()[0] ?? this.latest()[0]);
  rest = computed(() => this.latest().filter(n => n.id !== this.lead()?.id).slice(0, 3));
  programmeTotal = computed(() => this.faculties().reduce((sum, f) => sum + f.programmeCount, 0));

  voiceIndex = signal(0);
  voice = computed(() => this.testimonials()[this.voiceIndex()]);
  courseQuery = '';

  readonly stats = [
    { value: '18,400', label: 'Students' },
    { value: '74', label: 'Countries represented' },
    { value: '9 : 1', label: 'Students to each professor' },
    { value: '120', label: 'Partner universities' },
  ];

  readonly image = newsImage;
  readonly numeral = roman;

  private heroPhoto = viewChild.required<ElementRef<HTMLElement>>('heroPhoto');
  private heroPanel = viewChild.required<ElementRef<HTMLElement>>('heroPanel');
  private heroFinder = viewChild.required<ElementRef<HTMLElement>>('heroFinder');

  constructor() {
    // Entrance: the photograph settles, then the statement panel and finder rise into place.
    // Reduced motion keeps only a short fade.
    let mm: gsap.MatchMedia | undefined;
    afterNextRender(() => {
      const photo = this.heroPhoto().nativeElement.querySelector('img');
      const panel = this.heroPanel().nativeElement;
      const finder = this.heroFinder().nativeElement;
      mm = gsap.matchMedia();
      mm.add({ full: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' }, ctx => {
        if (ctx.conditions?.['reduced']) {
          gsap.from([panel, finder], { opacity: 0, duration: 0.15 });
          return;
        }
        gsap.timeline({ defaults: { ease: 'expo.out' } })
          .from(photo, { scale: 1.06, duration: 1.8 })
          .from(panel, { opacity: 0, y: 40, duration: 1.1 }, 0.15)
          .from(panel.children, { opacity: 0, y: 14, duration: 0.8, stagger: 0.07 }, 0.3)
          .from(finder, { opacity: 0, y: 20, duration: 0.9 }, 0.55);
      });
    });
    inject(DestroyRef).onDestroy(() => mm?.revert());
  }

  findCourse() {
    this.router.navigate(['/programmes'], { queryParams: { q: this.courseQuery || null } });
  }
}
