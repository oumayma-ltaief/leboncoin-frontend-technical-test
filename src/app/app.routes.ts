import { CONVERSATIONS_PATH } from './core/config/routes.config';
import { Routes } from '@angular/router';

export const ROUTES: Routes = [
  { path: '', redirectTo: CONVERSATIONS_PATH, pathMatch: 'full' },
  {
    path: CONVERSATIONS_PATH,
    loadChildren: () => import('./features/conversations/conversations.routes').then((m) => m.CONVERSATIONS_ROUTES)
  },
  { path: '**', redirectTo: CONVERSATIONS_PATH }
];
