import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';

// 0 means the browser couldn't connect. The dev server's proxy answers 502 to 504 when the API is off.
export function isUnreachable(status?: number) {
  return status === 0 || status === 502 || status === 503 || status === 504;
}

// Whether the API answered the last call. The app shows a banner while it's down.
@Injectable({ providedIn: 'root' })
export class ApiStatus {
  readonly down = signal(false);
}

export const apiStatusInterceptor: HttpInterceptorFn = (req, next) => {
  const status = inject(ApiStatus);
  return next(req).pipe(
    tap({
      next: event => { if (event instanceof HttpResponse) status.down.set(false); },
      error: err => status.down.set(isUnreachable(err.status)),
    }),
  );
};
