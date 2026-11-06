import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiStatus } from './core/api-status';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  template: `
    @if (api.down()) {
      <div class="alert alert--error api-down" role="alert">Can't reach the API, so this page is missing its content. Check that it's running, then reload.</div>
    }
    <router-outlet />
  `,
  styles: `.api-down { margin: 0; }`,
})
export class App {
  api = inject(ApiStatus);
}
