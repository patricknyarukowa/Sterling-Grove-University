import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService, errorMessage } from '../core/api.service';
import { NewsArticle } from '../core/models';

// CRUD screen for news: list (Read), panel form (Create / Update), and Delete.
@Component({
  selector: 'sgu-news-admin',
  imports: [ReactiveFormsModule, FormsModule, DatePipe, RouterLink],
  styleUrl: './admin.scss',
  template: `
    <div class="page-head">
      <h1>News</h1>
      <button class="btn btn--primary" (click)="openNew()">+ New article</button>
    </div>

    @if (message()) { <div class="alert" [class.alert--error]="isError()" [class.alert--success]="!isError()">{{ message() }}</div> }

    <div class="toolbar">
      <input class="input" placeholder="Search titles…" [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)" />
    </div>

    <div class="table-wrap">
      <table>
        <thead><tr><th>Title</th><th>Category</th><th>Published</th><th>Featured</th><th></th></tr></thead>
        <tbody>
          @for (n of filtered(); track n.id) {
            <tr>
              <td><a class="title-cell" [routerLink]="['/news', n.slug]" target="_blank">{{ n.title }}</a></td>
              <td><span class="tag">{{ n.category }}</span></td>
              <td>{{ n.publishedAt | date: 'd MMM y' }}</td>
              <td>@if (n.isFeatured) { <span class="tag">Featured</span> }</td>
              <td class="actions">
                <button class="btn btn--ghost btn--sm" (click)="edit(n)">Edit</button>
                <button class="btn btn--danger btn--sm" (click)="remove(n)">Delete</button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="5" class="empty">No articles found.</td></tr>
          }
        </tbody>
      </table>
    </div>

    @if (editing() !== undefined) {
      <div class="backdrop" (click)="close()"></div>
      <form class="panel" [formGroup]="form" (ngSubmit)="save()">
        <div class="panel__head">
          <h2>{{ editing() ? 'Edit article' : 'New article' }}</h2>
          <button type="button" class="panel__close" (click)="close()" aria-label="Close">×</button>
        </div>
        <div class="panel__body">
          @if (formError()) { <div class="alert alert--error">{{ formError() }}</div> }
          <div class="field"><label>Title</label><input formControlName="title" /></div>
          <div class="two">
            <div class="field"><label>Category</label>
              <input formControlName="category" list="news-categories" />
              <datalist id="news-categories">
                @for (c of categories; track c) { <option [value]="c"></option> }
              </datalist>
            </div>
            <div class="field"><label>Published</label><input type="datetime-local" formControlName="publishedAt" /></div>
          </div>
          <div class="field"><label>Author</label><input formControlName="author" /></div>
          <div class="field"><label>Summary</label><textarea rows="3" formControlName="summary"></textarea></div>
          <div class="field"><label>Body <span class="muted">(blank line = new paragraph)</span></label><textarea rows="10" formControlName="body"></textarea></div>
          <div class="field"><label>URL slug <span class="muted">(leave blank to generate)</span></label><input formControlName="slug" /></div>
          <label class="checkbox"><input type="checkbox" formControlName="isFeatured" /> Feature in the home page carousel</label>
        </div>
        <div class="panel__foot">
          <button type="button" class="btn btn--ghost" (click)="close()">Cancel</button>
          <button type="submit" class="btn btn--primary" [disabled]="form.invalid || saving()">{{ saving() ? 'Saving…' : 'Save' }}</button>
        </div>
      </form>
    }
  `,
})
export class NewsAdmin {
  private api = inject(ApiService);
  new = input<string>(); // ?new=1 opens the form straight away

  readonly categories = ['Research', 'Student Life', 'Announcements', 'Community', 'Teaching & Learning', 'Sport'];

  items = signal<NewsArticle[]>([]);
  searchTerm = signal('');
  filtered = computed(() => this.items().filter(n => n.title.toLowerCase().includes(this.searchTerm().toLowerCase())));

  editing = signal<NewsArticle | null | undefined>(undefined); // undefined = panel closed, null = creating
  saving = signal(false);
  formError = signal('');
  message = signal('');
  isError = signal(false);

  form = inject(FormBuilder).nonNullable.group({
    title: ['', Validators.required],
    slug: [''],
    category: ['Announcements', Validators.required],
    author: ['Sterling Grove Communications'],
    publishedAt: ['', Validators.required],
    summary: [''],
    body: [''],
    isFeatured: [false],
  });

  ngOnInit() {
    this.load();
    if (this.new()) this.openNew();
  }

  load() {
    this.api.news({ pageSize: 50 }).subscribe(r => this.items.set(r.items));
  }

  openNew() {
    this.form.reset({ category: 'Announcements', author: 'Sterling Grove Communications', publishedAt: nowLocalInput() });
    this.formError.set('');
    this.editing.set(null);
  }

  edit(n: NewsArticle) {
    this.form.reset({ ...n, publishedAt: toLocalInput(n.publishedAt) });
    this.formError.set('');
    this.editing.set(n);
  }

  close() { this.editing.set(undefined); }

  save() {
    const value = this.form.getRawValue();
    const existing = this.editing();
    this.saving.set(true);
    const request: Observable<unknown> = existing ? this.api.updateArticle(existing.id, value) : this.api.createArticle(value);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.close();
        this.flash(existing ? 'Article updated.' : 'Article published.');
        this.load();
      },
      error: err => { this.saving.set(false); this.formError.set(errorMessage(err)); },
    });
  }

  remove(n: NewsArticle) {
    if (!confirm(`Delete "${n.title}"? This cannot be undone.`)) return;
    this.api.deleteArticle(n.id).subscribe({
      next: () => { this.flash('Article deleted.'); this.load(); },
      error: err => this.flash(errorMessage(err), true),
    });
  }

  private flash(text: string, error = false) {
    this.message.set(text);
    this.isError.set(error);
    setTimeout(() => this.message.set(''), 4000);
  }
}

// "2026-10-26T08:00:00" -> "2026-10-26T08:00" for <input type="datetime-local">
export function toLocalInput(value: string | null | undefined) {
  return value ? value.slice(0, 16) : '';
}

// The current local date and time in the same "yyyy-MM-ddTHH:mm" format
export function nowLocalInput() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}
