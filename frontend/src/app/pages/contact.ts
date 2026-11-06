import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, errorMessage } from '../core/api.service';
import { Icon } from '../shared/icon';
import { PageHero } from '../shared/page-hero';

// /contact : saves the message to SQL Server via POST /api/contact
@Component({
  selector: 'sgu-contact',
  imports: [ReactiveFormsModule, PageHero, Icon],
  template: `
    <sgu-page-hero eyebrow="Get in touch" title="Write to Sterling Grove" image="hall-classical"
      lead="Questions about admissions, research partnerships or the press office. We reply within two working days." />

    <section class="section">
      <div class="container contact">
        <aside>
          <h2>The university office</h2>
          <div class="info"><sgu-icon name="pin" /><div><strong>Visit</strong><p>1 Vanguard Avenue<br>Sterling Grove Campus</p></div></div>
          <div class="info"><sgu-icon name="mail" /><div><strong>Email</strong><p><a href="mailto:hello@sterlinggrove.edu">hello&#64;sterlinggrove.edu</a></p></div></div>
          <div class="info"><sgu-icon name="calendar" /><div><strong>Office hours</strong><p>Monday to Friday, 08:00 to 16:30</p></div></div>
        </aside>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          @if (sent()) { <div class="alert alert--success">{{ sent() }}</div> }
          @if (error()) { <div class="alert alert--error">{{ error() }}</div> }

          <div class="row">
            <div class="field">
              <label for="name">Full name</label>
              <input id="name" formControlName="name" autocomplete="name" />
              @if (invalid('name')) { <span class="error">Please enter your name.</span> }
            </div>
            <div class="field">
              <label for="email">Email</label>
              <input id="email" type="email" formControlName="email" autocomplete="email" />
              @if (invalid('email')) { <span class="error">Please enter a valid email address.</span> }
            </div>
          </div>
          <div class="field">
            <label for="subject">Subject</label>
            <select id="subject" formControlName="subject">
              <option value="">Choose a topic</option>
              @for (s of subjects; track s) { <option [value]="s">{{ s }}</option> }
            </select>
            @if (invalid('subject')) { <span class="error">Please choose a topic.</span> }
          </div>
          <div class="field">
            <label for="message">Message</label>
            <textarea id="message" rows="6" formControlName="message"></textarea>
            @if (invalid('message')) { <span class="error">Please write a message (at least 10 characters).</span> }
          </div>
          <button class="btn btn--primary" type="submit" [disabled]="sending()">{{ sending() ? 'Sending…' : 'Send message' }}</button>
        </form>
      </div>
    </section>
  `,
  styles: `
    .contact { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 7fr); gap: clamp(40px, 6vw, 96px); align-items: start; }
    aside h2 { font-size: 1.9rem; padding-bottom: 20px; margin-bottom: 0; border-bottom: 1px solid var(--line-strong); }
    .info { display: flex; gap: 16px; padding: 22px 0; border-bottom: 1px solid var(--line); color: var(--gold-deep); }
    .info strong { color: var(--plum-900); font-size: .72rem; letter-spacing: .18em; text-transform: uppercase; }
    .info p { color: var(--ink-soft); margin: 6px 0 0; }
    form { background: var(--surface); border: 1px solid var(--line); border-top: 2px solid var(--plum); padding: clamp(28px, 4vw, 48px); }
    .row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 20px; }
    @media (max-width: 760px) { .contact, .row { grid-template-columns: minmax(0, 1fr); gap: 0; } .contact { gap: 40px; } }
  `,
})
export class Contact {
  private api = inject(ApiService);

  readonly subjects = ['Admissions', 'Programmes & courses', 'Research partnerships', 'Media enquiry', 'Alumni', 'Other'];

  form = inject(FormBuilder).nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  sending = signal(false);
  sent = signal('');
  error = signal('');

  invalid(name: keyof typeof this.form.controls) {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.sending.set(true);
    this.error.set('');
    this.api.sendMessage(this.form.getRawValue()).subscribe({
      next: res => {
        this.sent.set(res.message);
        this.form.reset();
        this.sending.set(false);
      },
      error: err => {
        this.error.set(errorMessage(err));
        this.sending.set(false);
      },
    });
  }
}
