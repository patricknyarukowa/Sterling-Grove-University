import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ApiService, errorMessage } from '../core/api.service';
import { FacultySummary } from '../core/models';
import { ICON_NAMES, Icon } from '../shared/icon';

@Component({
  selector: 'sgu-faculties-admin',
  imports: [ReactiveFormsModule, Icon],
  styleUrl: './admin.scss',
  template: `
    <div class="page-head">
      <h1>Faculties</h1>
      <button class="btn btn--primary" (click)="openNew()">+ New faculty</button>
    </div>

    @if (message()) { <div class="alert" [class.alert--error]="isError()" [class.alert--success]="!isError()">{{ message() }}</div> }

    <div class="table-wrap">
      <table>
        <thead><tr><th></th><th>Name</th><th>Dean</th><th>Programmes</th><th></th></tr></thead>
        <tbody>
          @for (f of items(); track f.id) {
            <tr>
              <td><sgu-icon [name]="f.icon" [size]="20" /></td>
              <td class="title-cell">{{ f.name }}</td>
              <td>{{ f.deanName }}</td>
              <td>{{ f.programmeCount }}</td>
              <td class="actions">
                <button class="btn btn--ghost btn--sm" (click)="edit(f)">Edit</button>
                <button class="btn btn--danger btn--sm" (click)="remove(f)">Delete</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    @if (editing() !== undefined) {
      <div class="backdrop" (click)="close()"></div>
      <form class="panel" [formGroup]="form" (ngSubmit)="save()">
        <div class="panel__head">
          <h2>{{ editing() ? 'Edit faculty' : 'New faculty' }}</h2>
          <button type="button" class="panel__close" (click)="close()" aria-label="Close">×</button>
        </div>
        <div class="panel__body">
          @if (formError()) { <div class="alert alert--error">{{ formError() }}</div> }
          <div class="field"><label>Name</label><input formControlName="name" /></div>
          <div class="field"><label>Tagline</label><input formControlName="tagline" /></div>
          <div class="two">
            <div class="field"><label>Dean</label><input formControlName="deanName" /></div>
            <div class="field"><label>Icon</label>
              <select formControlName="icon">
                @for (i of icons; track i) { <option [value]="i">{{ i }}</option> }
              </select>
            </div>
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
export class FacultiesAdmin {
  private api = inject(ApiService);

  readonly icons = ICON_NAMES;
  items = signal<FacultySummary[]>([]);
  editing = signal<FacultySummary | null | undefined>(undefined);
  saving = signal(false);
  formError = signal('');
  message = signal('');
  isError = signal(false);

  form = inject(FormBuilder).nonNullable.group({
    name: ['', Validators.required],
    tagline: [''],
    deanName: [''],
    icon: ['star'],
    description: [''],
  });

  ngOnInit() { this.load(); }

  load() { this.api.faculties().subscribe(items => this.items.set(items)); }

  openNew() {
    this.form.reset({ icon: 'star' });
    this.formError.set('');
    this.editing.set(null);
  }

  edit(f: FacultySummary) {
    this.form.reset(f);
    this.formError.set('');
    this.editing.set(f);
  }

  close() { this.editing.set(undefined); }

  save() {
    const existing = this.editing();
    // Keep the existing slug when editing so links to the faculty keep working
    const value = { ...this.form.getRawValue(), slug: existing?.slug ?? '' };
    this.saving.set(true);
    const request: Observable<unknown> = existing ? this.api.updateFaculty(existing.id, value) : this.api.createFaculty(value);
    request.subscribe({
      next: () => { this.saving.set(false); this.close(); this.flash(existing ? 'Faculty updated.' : 'Faculty created.'); this.load(); },
      error: err => { this.saving.set(false); this.formError.set(errorMessage(err)); },
    });
  }

  remove(f: FacultySummary) {
    if (!confirm(`Delete "${f.name}"?`)) return;
    this.api.deleteFaculty(f.id).subscribe({
      next: () => { this.flash('Faculty deleted.'); this.load(); },
      error: err => this.flash(errorMessage(err), true),
    });
  }

  private flash(text: string, error = false) {
    this.message.set(text);
    this.isError.set(error);
    setTimeout(() => this.message.set(''), 5000);
  }
}
