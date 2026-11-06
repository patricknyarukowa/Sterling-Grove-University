import { Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, catchError, of } from 'rxjs';
import { ApiService, errorMessage } from '../core/api.service';
import { PROGRAMME_LEVELS, Programme, ProgrammeLevel } from '../core/models';

@Component({
  selector: 'sgu-programmes-admin',
  imports: [ReactiveFormsModule],
  styleUrl: './admin.scss',
  template: `
    <div class="page-head">
      <h1>Programmes</h1>
      <button class="btn btn--primary" (click)="openNew()">+ New programme</button>
    </div>

    @if (message()) { <div class="alert" [class.alert--error]="isError()" [class.alert--success]="!isError()">{{ message() }}</div> }

    <div class="toolbar">
      <select class="input" (change)="facultyFilter.set(+$any($event.target).value || null)">
        <option value="">All faculties</option>
        @for (f of faculties(); track f.id) { <option [value]="f.id">{{ f.name }}</option> }
      </select>
    </div>

    <div class="table-wrap">
      <table>
        <thead><tr><th>Code</th><th>Title</th><th>Level</th><th>Years</th><th>Faculty</th><th></th></tr></thead>
        <tbody>
          @for (p of filtered(); track p.id) {
            <tr>
              <td>{{ p.code }}</td>
              <td class="title-cell">{{ p.title }}</td>
              <td><span class="tag">{{ levelLabel(p.level) }}</span></td>
              <td>{{ p.durationYears }}</td>
              <td>{{ p.facultyName }}</td>
              <td class="actions">
                <button class="btn btn--ghost btn--sm" (click)="edit(p)">Edit</button>
                <button class="btn btn--danger btn--sm" (click)="remove(p)">Delete</button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="6" class="empty">No programmes.</td></tr>
          }
        </tbody>
      </table>
    </div>

    @if (editing() !== undefined) {
      <div class="backdrop" (click)="close()"></div>
      <form class="panel" [formGroup]="form" (ngSubmit)="save()">
        <div class="panel__head">
          <h2>{{ editing() ? 'Edit programme' : 'New programme' }}</h2>
          <button type="button" class="panel__close" (click)="close()" aria-label="Close">×</button>
        </div>
        <div class="panel__body">
          @if (formError()) { <div class="alert alert--error">{{ formError() }}</div> }
          <div class="field"><label>Title</label><input formControlName="title" /></div>
          <div class="two">
            <div class="field"><label>Code</label><input formControlName="code" placeholder="e.g. SCI-AI" /></div>
            <div class="field"><label>Duration (years)</label><input type="number" step="0.5" min="0.5" max="8" formControlName="durationYears" /></div>
          </div>
          <div class="two">
            <div class="field"><label>Level</label>
              <select formControlName="level">
                @for (l of levels; track l.value) { <option [value]="l.value">{{ l.label }}</option> }
              </select>
            </div>
            <div class="field"><label>Faculty</label>
              <select formControlName="facultyId">
                @for (f of faculties(); track f.id) { <option [ngValue]="f.id">{{ f.name }}</option> }
              </select>
            </div>
          </div>
          <div class="field"><label>Summary</label><textarea rows="3" formControlName="summary"></textarea></div>
          <div class="field"><label>Admission requirements</label><textarea rows="4" formControlName="admissionRequirements"></textarea></div>
        </div>
        <div class="panel__foot">
          <button type="button" class="btn btn--ghost" (click)="close()">Cancel</button>
          <button type="submit" class="btn btn--primary" [disabled]="form.invalid || saving()">{{ saving() ? 'Saving…' : 'Save' }}</button>
        </div>
      </form>
    }
  `,
})
export class ProgrammesAdmin {
  private api = inject(ApiService);
  new = input<string>();

  readonly levels = PROGRAMME_LEVELS;
  faculties = toSignal(this.api.faculties().pipe(catchError(() => of([]))), { initialValue: [] });
  items = signal<Programme[]>([]);
  facultyFilter = signal<number | null>(null);
  filtered = computed(() => this.items().filter(p => !this.facultyFilter() || p.facultyId === this.facultyFilter()));

  editing = signal<Programme | null | undefined>(undefined);
  saving = signal(false);
  formError = signal('');
  message = signal('');
  isError = signal(false);

  form = inject(FormBuilder).nonNullable.group({
    title: ['', Validators.required],
    code: ['', Validators.required],
    level: ['Undergraduate' as ProgrammeLevel, Validators.required],
    durationYears: [3, [Validators.required, Validators.min(0.5), Validators.max(8)]],
    facultyId: [0, Validators.min(1)],
    summary: [''],
    admissionRequirements: [''],
  });

  ngOnInit() {
    this.load();
    if (this.new()) this.openNew();
  }

  load() { this.api.programmes().subscribe(items => this.items.set(items)); }

  openNew() {
    this.form.reset({ level: 'Undergraduate', durationYears: 3, facultyId: this.facultyFilter() ?? this.faculties()[0]?.id ?? 0 });
    this.formError.set('');
    this.editing.set(null);
  }

  edit(p: Programme) {
    this.form.reset(p);
    this.formError.set('');
    this.editing.set(p);
  }

  close() { this.editing.set(undefined); }

  save() {
    const value = this.form.getRawValue();
    const existing = this.editing();
    this.saving.set(true);
    const request: Observable<unknown> = existing ? this.api.updateProgramme(existing.id, value) : this.api.createProgramme(value);
    request.subscribe({
      next: () => { this.saving.set(false); this.close(); this.flash(existing ? 'Programme updated.' : 'Programme created.'); this.load(); },
      error: err => { this.saving.set(false); this.formError.set(errorMessage(err)); },
    });
  }

  remove(p: Programme) {
    if (!confirm(`Delete "${p.title}"?`)) return;
    this.api.deleteProgramme(p.id).subscribe({
      next: () => { this.flash('Programme deleted.'); this.load(); },
      error: err => this.flash(errorMessage(err), true),
    });
  }

  levelLabel(level: string) { return this.levels.find(l => l.value === level)?.label ?? level; }

  private flash(text: string, error = false) {
    this.message.set(text);
    this.isError.set(error);
    setTimeout(() => this.message.set(''), 4000);
  }
}
