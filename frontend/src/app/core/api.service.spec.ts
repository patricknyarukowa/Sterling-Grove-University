import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiService, errorMessage } from './api.service';

describe('errorMessage', () => {
  it('uses the message the API sent', () => {
    expect(errorMessage({ status: 409, error: { message: 'That slug is taken.' } })).toBe('That slug is taken.');
  });

  it('joins validation errors into one sentence', () => {
    expect(errorMessage({ status: 400, error: { errors: { Name: ['Name is required.'], Email: ['Email is invalid.'] } } }))
      .toBe('Name is required. Email is invalid.');
  });

  it.each([0, 502, 503, 504])('says the server is unreachable on status %i', status => {
    expect(errorMessage({ status })).toBe('Cannot reach the server. Is the API running?');
  });

  it.each([401, 403])('asks people to sign in again on status %i', status => {
    expect(errorMessage({ status })).toBe('You are not allowed to do that. Please sign in again.');
  });

  it('falls back to a general message', () => {
    expect(errorMessage({ status: 500 })).toBe('Something went wrong. Please try again.');
  });
});

describe('ApiService', () => {
  let api: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('leaves empty filters out of the URL', () => {
    api.programmes({ q: '', level: '', facultyId: null }).subscribe();
    http.expectOne('/api/programmes').flush([]);
  });

  it('sends the filters that have a value', () => {
    api.programmes({ q: 'data', level: 'Masters', facultyId: 2 }).subscribe();
    http.expectOne('/api/programmes?q=data&level=Masters&facultyId=2').flush([]);
  });

  it('keeps false, which is a real value', () => {
    api.markRead(5, false).subscribe();
    http.expectOne('/api/contact/5/read?isRead=false').flush(null);
  });
});
