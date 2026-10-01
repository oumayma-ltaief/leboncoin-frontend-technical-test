import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Component, inject } from '@angular/core';
import { ConversationList } from '../../components/conversation-list/conversation-list';
import { filter, map, Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  imports: [ConversationList, RouterOutlet],
  selector: 'app-conversations-layout',
  styleUrl: './conversations-layout.css',
  templateUrl: './conversations-layout.html',
  host: { class: 'block h-full' }
})
export class ConversationsLayout {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly isConversationOpen = toSignal(this.observeConversationOpening(), { initialValue: false });

  private hasConversationIdInActiveRoute(): boolean {
    return !!this.activatedRoute.firstChild?.snapshot.paramMap.has('id');
  }

  private observeConversationOpening(): Observable<boolean> {
    return this.router.events.pipe(
      filter((routerEvent) => routerEvent instanceof NavigationEnd),
      map(() => this.hasConversationIdInActiveRoute())
    );
  }
}
