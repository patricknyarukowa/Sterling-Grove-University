import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  AdminStats, CampusEvent, ContactMessage, Faculty, FacultyDetail, FacultySummary,
  NewsArticle, PagedResult, Programme, ProgrammeLevel, Testimonial,
} from './models';
import { isUnreachable } from './api-status';

// One place for every call to the backend. "/api" is forwarded to ASP.NET Core
// by proxy.conf.json while developing.
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  // Drops empty values so they don't end up as ?q=&level=
  private params(values: Record<string, string | number | boolean | null | undefined>) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(values)) {
      if (value !== null && value !== undefined && value !== '') params = params.set(key, String(value));
    }
    return params;
  }

  // Faculties
  faculties() { return this.http.get<FacultySummary[]>('/api/faculties'); }
  faculty(slug: string) { return this.http.get<FacultyDetail>(`/api/faculties/${slug}`); }
  createFaculty(f: Partial<Faculty>) { return this.http.post<Faculty>('/api/faculties', f); }
  updateFaculty(id: number, f: Partial<Faculty>) { return this.http.put<void>(`/api/faculties/${id}`, f); }
  deleteFaculty(id: number) { return this.http.delete<void>(`/api/faculties/${id}`); }

  // Programmes
  programmes(filter: { q?: string; level?: ProgrammeLevel | ''; facultyId?: number | null } = {}) {
    return this.http.get<Programme[]>('/api/programmes', { params: this.params(filter) });
  }
  createProgramme(p: Partial<Programme>) { return this.http.post<Programme>('/api/programmes', p); }
  updateProgramme(id: number, p: Partial<Programme>) { return this.http.put<void>(`/api/programmes/${id}`, p); }
  deleteProgramme(id: number) { return this.http.delete<void>(`/api/programmes/${id}`); }

  // News
  news(filter: { q?: string; category?: string; featured?: boolean; page?: number; pageSize?: number } = {}) {
    return this.http.get<PagedResult<NewsArticle>>('/api/news', { params: this.params(filter) });
  }
  newsCategories() { return this.http.get<string[]>('/api/news/categories'); }
  article(slug: string) { return this.http.get<NewsArticle>(`/api/news/${slug}`); }
  createArticle(n: Partial<NewsArticle>) { return this.http.post<NewsArticle>('/api/news', n); }
  updateArticle(id: number, n: Partial<NewsArticle>) { return this.http.put<void>(`/api/news/${id}`, n); }
  deleteArticle(id: number) { return this.http.delete<void>(`/api/news/${id}`); }

  // Events
  events(upcoming = false, take?: number) {
    return this.http.get<CampusEvent[]>('/api/events', { params: this.params({ upcoming, take }) });
  }
  createEvent(e: Partial<CampusEvent>) { return this.http.post<CampusEvent>('/api/events', e); }
  updateEvent(id: number, e: Partial<CampusEvent>) { return this.http.put<void>(`/api/events/${id}`, e); }
  deleteEvent(id: number) { return this.http.delete<void>(`/api/events/${id}`); }

  // Testimonials
  testimonials() { return this.http.get<Testimonial[]>('/api/testimonials'); }

  // Contact
  sendMessage(m: Pick<ContactMessage, 'name' | 'email' | 'subject' | 'message'>) {
    return this.http.post<{ message: string }>('/api/contact', m);
  }
  inbox() { return this.http.get<ContactMessage[]>('/api/contact'); }
  markRead(id: number, isRead: boolean) {
    return this.http.put<void>(`/api/contact/${id}/read`, null, { params: this.params({ isRead }) });
  }
  deleteMessage(id: number) { return this.http.delete<void>(`/api/contact/${id}`); }

  // Admin
  stats() { return this.http.get<AdminStats>('/api/admin/stats'); }
}

// Turns an API error into a sentence for the UI
export function errorMessage(err: unknown): string {
  const e = err as { status?: number; error?: { message?: string; errors?: Record<string, string[]> } };
  if (e?.error?.message) return e.error.message;
  if (e?.error?.errors) return Object.values(e.error.errors).flat().join(' ');
  if (isUnreachable(e?.status)) return 'Cannot reach the server. Is the API running?';
  if (e?.status === 401 || e?.status === 403) return 'You are not allowed to do that. Please sign in again.';
  return 'Something went wrong. Please try again.';
}
