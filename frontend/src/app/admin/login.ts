import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { errorMessage } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Crest } from '../shared/crest';

@Component({
  selector: 'sgu-login',
  imports: [ReactiveFormsModule, RouterLink, Crest],
  template: `
    <div class="page">
      <div class="page__photo photo on-dark" aria-hidden="true">
        <img src="images/library-reading-room.jpg" alt="" width="1920" height="1280" />
        <p class="page__motto">Knowledge · Leadership · Legacy</p>
      </div>
      <form class="box" [formGroup]="form" (ngSubmit)="submit()">
        <a routerLink="/" class="brand"><sgu-crest [size]="44" /></a>
        <h1>Staff sign in</h1>
        <p class="muted">Manage news, events, programmes and messages.</p>

        @if (error()) { <div class="alert alert--error">{{ error() }}</div> }

        <div class="field">
          <label for="email">Email</label>
          <input id="email" type="email" formControlName="email" autocomplete="username" />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input id="password" type="password" formControlName="password" autocomplete="current-password" />
        </div>
        <button class="btn btn--primary" type="submit" [disabled]="form.invalid || busy()">{{ busy() ? 'Signing in…' : 'Sign in' }}</button>
        <a routerLink="/" class="back">Back to the website</a>
      </form>
    </div>
  `,
  styles: `
    .page { min-height: 100dvh; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 560px); background: var(--paper); }
    .page__photo { position: relative; }
    .page__photo::before { content: ''; position: absolute; inset: 0; z-index: 1; background: linear-gradient(0deg, rgba(34, 16, 61, .85), rgba(34, 16, 61, .15) 60%); }
    .page__motto { position: absolute; z-index: 2; left: 48px; bottom: 40px; margin: 0; color: var(--gold); font-size: .7rem; font-weight: 600; letter-spacing: .26em; text-transform: uppercase; }
    .box { align-self: center; width: 100%; max-width: 440px; margin: 0 auto; padding: 48px 40px; }
    .brand { display: inline-block; text-decoration: none; margin-bottom: 40px; }
    h1 { font-size: 2.4rem; margin-bottom: 6px; }
    .box > .muted { margin-bottom: 32px; }
    .btn { width: 100%; margin-top: 8px; }
    .back { display: block; text-align: center; margin-top: 24px; font-size: .9rem; }
    @media (max-width: 860px) {
      .page { grid-template-columns: minmax(0, 1fr); }
      .page__photo { display: none; }
      .box { padding: 40px 20px; }
    }
  `,
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  returnUrl = input<string>(); // ?returnUrl= from the admin guard

  form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  busy = signal(false);
  error = signal('');

  submit() {
    const { email, password } = this.form.getRawValue();
    this.busy.set(true);
    this.error.set('');
    this.auth.login(email, password).subscribe({
      next: me => {
        this.busy.set(false);
        if (!me.roles.includes('Admin')) {
          this.auth.logout(false);
          this.error.set('This account does not have admin access.');
          return;
        }
        this.router.navigateByUrl(this.returnUrl() || '/admin');
      },
      error: err => {
        this.busy.set(false);
        this.error.set(err.status === 401 ? 'Incorrect email or password.' : errorMessage(err));
      },
    });
  }
}
