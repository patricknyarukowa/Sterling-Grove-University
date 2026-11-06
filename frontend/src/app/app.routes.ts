import { Routes } from '@angular/router';
import { adminGuard } from './core/auth.service';
import { PublicLayout } from './layout/public-layout';

// loadComponent splits each page into its own file that downloads only when visited.
export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', loadComponent: () => import('./pages/home').then(m => m.Home), title: 'Sterling Grove University | Knowledge, Leadership, Legacy' },
      { path: 'about', loadComponent: () => import('./pages/about').then(m => m.About), title: 'About | Sterling Grove University' },
      { path: 'faculties', loadComponent: () => import('./pages/faculties').then(m => m.Faculties), title: 'Faculties | Sterling Grove University' },
      { path: 'faculties/:slug', loadComponent: () => import('./pages/faculties').then(m => m.FacultyDetail), title: 'Faculty | Sterling Grove University' },
      { path: 'programmes', loadComponent: () => import('./pages/programmes').then(m => m.Programmes), title: 'Programmes | Sterling Grove University' },
      { path: 'news', loadComponent: () => import('./pages/news').then(m => m.News), title: 'News | Sterling Grove University' },
      { path: 'news/:slug', loadComponent: () => import('./pages/news').then(m => m.NewsDetail), title: 'News | Sterling Grove University' },
      { path: 'events', loadComponent: () => import('./pages/events').then(m => m.Events), title: 'Events | Sterling Grove University' },
      { path: 'contact', loadComponent: () => import('./pages/contact').then(m => m.Contact), title: 'Contact | Sterling Grove University' },
    ],
  },
  { path: 'admin/login', loadComponent: () => import('./admin/login').then(m => m.Login), title: 'Staff sign in | Sterling Grove' },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./admin/admin-layout').then(m => m.AdminLayout),
    children: [
      { path: '', loadComponent: () => import('./admin/dashboard').then(m => m.Dashboard), title: 'Dashboard | Admin' },
      { path: 'news', loadComponent: () => import('./admin/news-admin').then(m => m.NewsAdmin), title: 'News | Admin' },
      { path: 'events', loadComponent: () => import('./admin/events-admin').then(m => m.EventsAdmin), title: 'Events | Admin' },
      { path: 'programmes', loadComponent: () => import('./admin/programmes-admin').then(m => m.ProgrammesAdmin), title: 'Programmes | Admin' },
      { path: 'faculties', loadComponent: () => import('./admin/faculties-admin').then(m => m.FacultiesAdmin), title: 'Faculties | Admin' },
      { path: 'messages', loadComponent: () => import('./admin/messages-admin').then(m => m.MessagesAdmin), title: 'Messages | Admin' },
    ],
  },
  {
    path: '**',
    component: PublicLayout,
    children: [{ path: '', loadComponent: () => import('./pages/not-found').then(m => m.NotFound), title: 'Page not found' }],
  },
];
