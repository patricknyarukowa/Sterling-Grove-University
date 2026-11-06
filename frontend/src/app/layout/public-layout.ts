import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './footer';
import { Header } from './header';

// Wraps every public page with the header and footer. Admin pages use their own layout.
@Component({
  selector: 'sgu-public-layout',
  imports: [RouterOutlet, Header, Footer],
  template: `
    <sgu-header />
    <main id="main"><router-outlet /></main>
    <sgu-footer />
  `,
})
export class PublicLayout {}
