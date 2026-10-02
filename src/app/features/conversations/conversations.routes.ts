import { activeUserGuard } from './guards/active-user/active-user';
import { Routes } from '@angular/router';

export const CONVERSATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/conversations-layout/conversations-layout').then((m) => m.ConversationsLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/conversation-empty/conversation-empty').then((m) => m.ConversationEmpty)
      },
      {
        path: ':id',
        canActivate: [activeUserGuard],
        loadComponent: () => import('./pages/conversation-detail/conversation-detail').then((m) => m.ConversationDetail)
      }
    ]
  }
];
