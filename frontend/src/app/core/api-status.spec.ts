import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiStatus, apiStatusInterceptor } from './api-status';

describe('apiStatusInterceptor', () => {
  let client: HttpClient;
  let http: HttpTestingController;
  let status: ApiStatus;

  function respond(code: number) {
    client.get('/api/news').subscribe({ error: () => {} });
    http.expectOne('/api/news').flush(null, { status: code, statusText: 'x' });
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([apiStatusInterceptor])), provideHttpClientTesting()],
    });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
    status = TestBed.inject(ApiStatus);
  });

  it('flags the API as down when the dev server proxy can\'t reach it', () => {
    respond(502);
    expect(status.down()).toBe(true);
  });

  it('flags the API as down when the browser can\'t connect at all', () => {
    client.get('/api/news').subscribe({ error: () => {} });
    http.expectOne('/api/news').error(new ProgressEvent('error'));
    expect(status.down()).toBe(true);
  });

  it('clears the flag once a call succeeds', () => {
    respond(502);
    respond(200);
    expect(status.down()).toBe(false);
  });

  it.each([400, 401, 404, 429, 500])('treats %i as the API answering', code => {
    respond(502);
    respond(code);
    expect(status.down()).toBe(false);
  });
});
