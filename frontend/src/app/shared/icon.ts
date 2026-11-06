import { Component, input } from '@angular/core';

// Simple line icons drawn with SVG. Faculty records store one of these names.
export const ICON_NAMES = ['gear', 'atom', 'chart', 'pulse', 'scales', 'feather', 'star', 'book', 'cap', 'users', 'calendar', 'pin', 'search', 'globe', 'flask', 'mail'] as const;

@Component({
  selector: 'sgu-icon',
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      @switch (name()) {
        @case ('gear') { <circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M4.2 6.2l2.1 2.1M17.7 15.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 17.8l2.1-2.1M17.7 8.3l2.1-2.1"/><circle cx="12" cy="12" r="6.5"/> }
        @case ('atom') { <circle cx="12" cy="12" r="1.6"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/> }
        @case ('chart') { <path d="M3 21h18M6 17V11M11 17V6M16 17v-4M21 3l-6 6-3-3-6 6"/> }
        @case ('pulse') { <path d="M2 12h4l2-5 4 10 2-5h8"/> }
        @case ('scales') { <path d="M12 3v18M7 21h10M4 7h16M7 7l-3 7a3 3 0 0 0 6 0L7 7ZM17 7l-3 7a3 3 0 0 0 6 0l-3-7Z"/> }
        @case ('feather') { <path d="M20 4c-7 0-13 5-13 13v3M7 17h7M20 4c0 8-4 13-11 13"/> }
        @case ('book') { <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/><path d="M4 19a2 2 0 0 1 2-2h13"/> }
        @case ('cap') { <path d="M2 9l10-5 10 5-10 5L2 9Z"/><path d="M6 11v5c3 2 9 2 12 0v-5M22 9v6"/> }
        @case ('users') { <circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-4 3-6 6.5-6s6 2 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.5 0 4 1.6 4.5 4.5"/> }
        @case ('calendar') { <rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 10h18M8 3v4M16 3v4"/> }
        @case ('pin') { <path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/> }
        @case ('search') { <circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/> }
        @case ('globe') { <circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/> }
        @case ('flask') { <path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3M7 15h10"/> }
        @case ('mail') { <rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 6 9 7 9-7"/> }
        @default { <path d="M12 2 14.6 9.4 22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6Z"/> }
      }
    </svg>
  `,
  styles: `:host { display: inline-flex; line-height: 0; }`,
})
export class Icon {
  name = input('star');
  size = input(24);
}
