import { AppError } from '../../../errors/models/app-error/app-error';
import { computed, inject, resource, Service, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { toAppError } from '../../../errors/utils/to-app-error/to-app-error';
import { User } from '../../models/user/user.interface';
import { Users } from '../users/users';

const ACTIVE_USER_ID_STORAGE_KEY = 'leboncoin-active-user-id';

@Service()
export class UserSession {
  private readonly usersService = inject(Users);
  private readonly usersResource = resource({ loader: () => firstValueFrom(this.usersService.getUsers()) });
  private readonly activeUserId = signal<number | undefined>(this.getSavedActiveUserId());

  readonly userList = computed(() => (this.usersResource.hasValue() ? this.usersResource.value() : []));
  readonly isLoadingUserList = this.usersResource.isLoading;
  readonly userListLoadingError = computed<AppError | undefined>(() => {
    const error = this.usersResource.error();
    return error ? toAppError(error) : undefined;
  });

  readonly activeUser = computed<User | undefined>(() => {
    const users = this.userList();
    return users.find((user) => user.id === this.activeUserId()) ?? users[0];
  });

  reloadUserList(): void {
    this.usersResource.reload();
  }

  setActiveUser(userId: number): void {
    this.activeUserId.set(userId);
    this.saveActiveUserId(userId);
  }

  private getSavedActiveUserId(): number | undefined {
    const savedActiveUserId = localStorage.getItem(ACTIVE_USER_ID_STORAGE_KEY);
    return savedActiveUserId ? Number(savedActiveUserId) : undefined;
  }

  private saveActiveUserId(userId: number): void {
    localStorage.setItem(ACTIVE_USER_ID_STORAGE_KEY, String(userId));
  }
}
