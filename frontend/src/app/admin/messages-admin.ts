import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ApiService } from '../core/api.service';
import { ContactMessage } from '../core/models';

// Inbox for the public Contact form: read, mark read/unread, delete.
@Component({
  selector: 'sgu-messages-admin',
  imports: [DatePipe],
  styleUrl: './admin.scss',
  template: `
    <div class="page-head">
      <h1>Messages</h1>
      <span class="muted">{{ unread() }} unread</span>
    </div>

    <div class="inbox">
      <ul class="list">
        @for (m of items(); track m.id) {
          <li>
            <button type="button" [class.unread]="!m.isRead" [class.selected]="selected()?.id === m.id" (click)="open(m)">
              <strong>{{ m.name }}</strong>
              <span>{{ m.subject }}</span>
              <time>{{ m.createdAt | date: 'd MMM, HH:mm' }}</time>
            </button>
          </li>
        } @empty {
          <li class="empty">No messages yet. Messages from the Contact page appear here.</li>
        }
      </ul>

      <section class="reader">
        @if (selected(); as m) {
          <header>
            <h2>{{ m.subject }}</h2>
            <p class="muted">From <strong>{{ m.name }}</strong> &lt;<a [href]="'mailto:' + m.email">{{ m.email }}</a>&gt; · {{ m.createdAt | date: 'd MMM y, HH:mm' }}</p>
          </header>
          <p class="body">{{ m.message }}</p>
          <div class="reader__actions">
            <a class="btn btn--primary btn--sm" [href]="'mailto:' + m.email + '?subject=Re: ' + m.subject">Reply by email</a>
            <button class="btn btn--ghost btn--sm" (click)="toggleRead(m)">Mark as {{ m.isRead ? 'unread' : 'read' }}</button>
            <button class="btn btn--danger btn--sm" (click)="remove(m)">Delete</button>
          </div>
        } @else {
          <p class="muted">Select a message to read it.</p>
        }
      </section>
    </div>
  `,
  styles: `
    .inbox { display: grid; grid-template-columns: 340px 1fr; background: #fff; border: 1px solid var(--line); border-radius: 6px; min-height: 480px; }
    .list { list-style: none; margin: 0; padding: 0; border-right: 1px solid var(--line); overflow-y: auto; max-height: 70vh; }
    .list button { width: 100%; text-align: left; display: grid; grid-template-columns: 1fr auto; gap: 2px 12px; padding: 14px 18px; border: 0; border-bottom: 1px solid var(--line); background: none; font: inherit; cursor: pointer; color: var(--ink-soft); }
    .list button span { grid-column: 1; font-size: .88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .list button time { grid-row: 1; grid-column: 2; font-size: .75rem; color: var(--muted); }
    .list button.unread { color: var(--ink); border-left: 3px solid var(--gold); }
    .list button.unread strong::after { content: ' •'; color: var(--plum); }
    .list button.selected { background: var(--plum-100); }
    .reader { padding: 28px 32px; }
    .reader h2 { font-size: 1.8rem; }
    .body { white-space: pre-wrap; padding: 20px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
    .reader__actions { display: flex; flex-wrap: wrap; gap: 8px; }
    @media (max-width: 800px) { .inbox { grid-template-columns: 1fr; } .list { border-right: 0; border-bottom: 1px solid var(--line); max-height: 40vh; } }
  `,
})
export class MessagesAdmin {
  private api = inject(ApiService);

  items = signal<ContactMessage[]>([]);
  selected = signal<ContactMessage | null>(null);
  unread = computed(() => this.items().filter(m => !m.isRead).length);

  ngOnInit() { this.load(); }

  load() { this.api.inbox().subscribe(items => this.items.set(items)); }

  open(m: ContactMessage) {
    this.selected.set(m);
    if (!m.isRead) this.setRead(m, true);
  }

  toggleRead(m: ContactMessage) { this.setRead(m, !m.isRead); }

  private setRead(m: ContactMessage, isRead: boolean) {
    this.api.markRead(m.id, isRead).subscribe(() => {
      const updated = { ...m, isRead };
      this.items.update(list => list.map(x => (x.id === m.id ? updated : x)));
      if (this.selected()?.id === m.id) this.selected.set(updated);
    });
  }

  remove(m: ContactMessage) {
    if (!confirm('Delete this message?')) return;
    this.api.deleteMessage(m.id).subscribe(() => {
      this.selected.set(null);
      this.load();
    });
  }
}
