import { DatePipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ApiService, errorMessage } from '../core/api.service';
import { CampusEvent } from '../core/models';
import { nowLocalInput, toLocalInput } from './news-admin';

@Component({
  selector: 'sgu-events-admin',
  imports: [ReactiveFormsModule, DatePipe],
  styleUrl: './admin.scss',
  template: `
    <div class="page-head">
      <h1>Events</h1>
      <button class="btn btn--primary" (click)="openNew()">+ New event</button>
    </div>

    @if (message()) { <div class="alert alert--success">{{ message() }}</div> }

    <div class="table-wrap">
      <table>
        <thead><tr><th>Event</th><th>Starts</th><th>Location</th><th>Category</th><th></th></tr></thead>
        <tbody>
          @for (e of items(); track e.id) {
            <tr>
              <td class="title-cell">{{ e.title }}</td>
              <td>{{ e.startsAt | date: 'd MMM y, HH:mm' }}</td>
              <td>{{ e.location }}</td>
              <td><span class="tag">{{ e.category }}</span></td>
              <td class="actions">
                <button class="btn btn--ghost btn--sm" (click)="edit(e)">Edit</button>
                <button class="btn btn--danger btn--sm" (click)="remove(e)">Delete</button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="5" class="empty">No events yet.</td></tr>
          }
        </tbody>
      </table>
    </div>

    @if (editing() !== undefined) {
      <div class="backdrop" (click)="close()"></div>
      <form class="panel" [formGroup]="form" (ngSubmit)="save()">
        <div class="panel__head">
          <h2>{{ editing() ? 'Edit event' : 'New event' }}</h2>
          <button type="button" class="panel__close" (click)="close()" aria-label="Close">×</button>
        </div>
        <div class="panel__body">
          @if (formError()) { <div class="alert alert--error">{{ formError() }}</div> }
          <div class="field"><label>Title</label><input formControlName="title" /></div>
          <div class="two">
            <div class="field"><label>Starts</label><input type="datetime-local" formControlName="startsAt" /></div>
            <div class="field"><label>Ends</label><input type="datetime-local" formControlName="endsAt" /></div>
          </div>
          <div class="two">
            <div class="field"><label>Location</label><input formControlName="location" /></div>
            <div class="field"><label>Category</label><input formControlName="category" /></div>
          </div>
          <div class="field"><label>Description</label><textarea rows="5" formControlName="description"></textarea></div>
        </div>
        <div class="panel__foot">
          <button type="button" class="btn btn--ghost" (click)="close()">Cancel</button>
          <button type="submit" class="btn btn--primary" [disabled]="form.invalid || saving()">{{ saving() ? 'Saving…' : 'Save' }}</button>
        </div>
      </form>
    }
  `,
})
export class EventsAdmin {
  private api = inject(ApiService);
  new = input<string>();

  items = signal<CampusEvent[]>([]);
  editing = signal<CampusEvent | null | undefined>(undefined);
  saving = signal(false);
  formError = signal('');
  message = signal('');

  form = inject(FormBuilder).nonNullable.group({
    title: ['', Validators.required],
    startsAt: ['', Validators.required],
    endsAt: [''],
    location: [''],
    category: ['General'],
    description: [''],
  });

  ngOnInit() {
    this.load();
    if (this.new()) this.openNew();
  }

  load() { this.api.events().subscribe(items => this.items.set(items)); }

  openNew() {
    this.form.reset({ category: 'General', startsAt: nowLocalInput() });
    this.formError.set('');
    this.editing.set(null);
  }

  edit(e: CampusEvent) {
    this.form.reset({ ...e, startsAt: toLocalInput(e.startsAt), endsAt: toLocalInput(e.endsAt) });
    this.formError.set('');
    this.editing.set(e);
  }

  close() { this.editing.set(undefined); }

  save() {
    const v = this.form.getRawValue();
    const body = { ...v, endsAt: v.endsAt || null };
    const existing = this.editing();
    this.saving.set(true);
    const request: Observable<unknown> = existing ? this.api.updateEvent(existing.id, body) : this.api.createEvent(body);
    request.subscribe({
      next: () => { this.saving.set(false); this.close(); this.flash(existing ? 'Event updated.' : 'Event created.'); this.load(); },
      error: err => { this.saving.set(false); this.formError.set(errorMessage(err)); },
    });
  }

  remove(e: CampusEvent) {
    if (!confirm(`Delete "${e.title}"?`)) return;
    this.api.deleteEvent(e.id).subscribe(() => { this.flash('Event deleted.'); this.load(); });
  }

  private flash(text: string) {
    this.message.set(text);
    setTimeout(() => this.message.set(''), 4000);
  }
}
