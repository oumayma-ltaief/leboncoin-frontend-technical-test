import { Component, computed, inject } from '@angular/core';
import { Connectivity } from '../../core/connectivity/services/connectivity/connectivity';
import { UpperCasePipe } from '@angular/common';
import { UserSession } from '../../core/users/services/user-session/user-session';

const OFFLINE_STATUS_CLASS = 'bg-red-400';
const OFFLINE_STATUS_LABEL = 'offline';
const ONLINE_STATUS_CLASS = 'bg-green-500';
const ONLINE_STATUS_LABEL = 'online';

@Component({
  imports: [UpperCasePipe],
  selector: 'app-active-user',
  styleUrl: './active-user.css',
  templateUrl: './active-user.html'
})
export class ActiveUser {
  private readonly connectivity = inject(Connectivity);
  private readonly userSession = inject(UserSession);

  protected readonly activeUser = this.userSession.activeUser;
  protected readonly connectivityStatusClass = computed(() => (this.connectivity.isOnline() ? ONLINE_STATUS_CLASS : OFFLINE_STATUS_CLASS));
  protected readonly connectivityStatusLabel = computed(() => (this.connectivity.isOnline() ? ONLINE_STATUS_LABEL : OFFLINE_STATUS_LABEL));
}
