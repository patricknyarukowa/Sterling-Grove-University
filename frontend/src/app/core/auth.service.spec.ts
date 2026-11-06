import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { firstValueFrom, isObservable } from 'rxjs';
import { AuthService, adminGuard, authInterceptor } from './auth.service';

const KEY = 'sgu.session';

function storeSession(roles: string[], expiresIn = 3_600_000) {
  localStorage.setItem(KEY, JSON.stringify({ token: 'stored-token', expiresAt: Date.now() + expiresIn, email: 'a@example.com', roles }));
}

function setUp() {
  TestBed.configureTestingModule({
    providers: [provideRouter([{ path: 'admin/login', children: [] }]), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
  });
  return { http: TestBed.inject(HttpTestingController), client: TestBed.inject(HttpClient) };
}

async function runGuard(url = '/admin/news') {
  const result = TestBed.runInInjectionContext(() =>
    adminGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot));
  const value = isObservable(result) ? await firstValueFrom(result) : result;
  return value instanceof UrlTree ? TestBed.inject(Router).serializeUrl(value) : value;
}

describe('adminGuard', () => {
  beforeEach(() => localStorage.clear());

  it('sends visitors to sign in, then back to where they were going', async () => {
    setUp();
    expect(await runGuard()).toBe('/admin/login?returnUrl=%2Fadmin%2Fnews');
  });

  it('lets an admin in', async () => {
    storeSession(['Admin']);
    setUp();
    expect(await runGuard()).toBe(true);
  });

  it('keeps out a signed-in user who is not an admin', async () => {
    storeSession([]);
    setUp();
    expect(await runGuard()).toBe('/admin/login?returnUrl=%2Fadmin%2Fnews');
  });

  it('keeps out an admin whose session has expired', async () => {
    storeSession(['Admin'], -1000);
    setUp();
    expect(await runGuard()).toBe('/admin/login?returnUrl=%2Fadmin%2Fnews');
  });
});

describe('AuthService', () => {
  beforeEach(() => localStorage.clear());

  it('signs in with the token, fetches who it is, and remembers the session', async () => {
    const { http } = setUp();
    const auth = TestBed.inject(AuthService);

    const done = firstValueFrom(auth.login('admin@example.com', 'secret'));
    http.expectOne('/api/auth/login').flush({ tokenType: 'Bearer', accessToken: 'new-token', expiresIn: 3600, refreshToken: 'r' });
    const me = http.expectOne('/api/auth/me');
    expect(me.request.headers.get('Authorization')).toBe('Bearer new-token');
    me.flush({ email: 'admin@example.com', roles: ['Admin'] });
    await done;

    expect(auth.isAdmin()).toBe(true);
    expect(JSON.parse(localStorage.getItem(KEY)!).token).toBe('new-token');
  });

  it('forgets the session on sign out', () => {
    storeSession(['Admin']);
    setUp();
    const auth = TestBed.inject(AuthService);

    auth.logout(false);

    expect(auth.isAdmin()).toBe(false);
    expect(auth.token).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('survives a corrupted session in storage', () => {
    localStorage.setItem(KEY, '{not json');
    setUp();
    expect(TestBed.inject(AuthService).isAdmin()).toBe(false);
  });
});

describe('authInterceptor', () => {
  beforeEach(() => localStorage.clear());

  it('adds the token to API calls', () => {
    storeSession(['Admin']);
    const { http, client } = setUp();
    client.get('/api/contact').subscribe();
    expect(http.expectOne('/api/contact').request.headers.get('Authorization')).toBe('Bearer stored-token');
  });

  it('never sends the token anywhere else', () => {
    storeSession(['Admin']);
    const { http, client } = setUp();
    client.get('https://example.com/data').subscribe();
    expect(http.expectOne('https://example.com/data').request.headers.has('Authorization')).toBe(false);
  });

  it('adds nothing when signed out', () => {
    const { http, client } = setUp();
    client.get('/api/news').subscribe();
    expect(http.expectOne('/api/news').request.headers.has('Authorization')).toBe(false);
  });

  it('signs out when the API rejects the token', () => {
    storeSession(['Admin']);
    const { http, client } = setUp();
    const auth = TestBed.inject(AuthService);
    client.get('/api/contact').subscribe({ error: () => {} });

    http.expectOne('/api/contact').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(auth.token).toBeNull();
  });

  it('stays signed in on other errors', () => {
    storeSession(['Admin']);
    const { http, client } = setUp();
    const auth = TestBed.inject(AuthService);
    client.get('/api/contact').subscribe({ error: () => {} });

    http.expectOne('/api/contact').flush(null, { status: 500, statusText: 'Server error' });

    expect(auth.token).toBe('stored-token');
  });
});
