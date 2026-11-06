import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';

interface LoginResponse { tokenType: string; accessToken: string; expiresIn: number; refreshToken: string; }
interface Me { email: string; roles: string[]; }

const STORAGE_KEY = 'sgu.session';

interface Session { token: string; expiresAt: number; email: string; roles: string[]; }

// Keeps the logged-in admin's token and roles. The token is sent with every
// API call by authInterceptor below.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private session = signal<Session | null>(this.load());

  readonly user = computed(() => this.session());
  readonly isAdmin = computed(() => {
    const s = this.session();
    return !!s && s.expiresAt > Date.now() && s.roles.includes('Admin');
  });

  get token() { return this.session()?.token ?? null; }

  login(email: string, password: string): Observable<Me> {
    return this.http.post<LoginResponse>('/api/auth/login', { email, password }).pipe(
      switchMap(res =>
        this.http.get<Me>('/api/auth/me', { headers: { Authorization: `Bearer ${res.accessToken}` } }).pipe(
          tap(me => this.save({ token: res.accessToken, expiresAt: Date.now() + res.expiresIn * 1000, ...me })),
        ),
      ),
    );
  }

  logout(redirect = true) {
    this.save(null);
    if (redirect) this.router.navigateByUrl('/admin/login');
  }

  private save(session: Session | null) {
    this.session.set(session);
    try {
      if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      else localStorage.removeItem(STORAGE_KEY);
    } catch { /* storage blocked: the session just won't survive a reload */ }
  }

  private load(): Session | null {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Session | null;
      return s && s.expiresAt > Date.now() ? s : null;
    } catch {
      return null;
    }
  }
}

// Adds "Authorization: Bearer <token>" to API calls, and signs out on a 401.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;
  const authed = token && req.url.startsWith('/api') && !req.headers.has('Authorization')
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authed).pipe(
    catchError(err => {
      if (err.status === 401 && token) auth.logout();
      return throwError(() => err);
    }),
  );
};

// Protects /admin pages: anyone who isn't an Admin is sent to the login page.
export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return of(auth.isAdmin()).pipe(
    map(ok => ok || router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } })),
  );
};
