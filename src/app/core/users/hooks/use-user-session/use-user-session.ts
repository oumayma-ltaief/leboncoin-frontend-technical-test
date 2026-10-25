import type { AppError } from '../../../errors/models/app-error/app-error';
import { isLoadingQuery } from '../../../query/utils/is-loading-query/is-loading-query';
import { useActiveUserId } from '../../contexts/active-user-id/active-user-id';
import { useQuery } from '@tanstack/react-query';
import type { User } from '../../models/user/user';
import { Users } from '../../services/users/users';

const NO_USERS: User[] = [];
const USER_LIST_QUERY_KEY = ['users'];

export interface UserSession {
  activeUser: User | undefined;
  isLoadingUserList: boolean;
  reloadUserList: () => void;
  setActiveUser: (userId: number) => void;
  userList: User[];
  userListLoadingError: AppError | undefined;
}

export function useUserSession(): UserSession {
  const { activeUserId, setActiveUserId } = useActiveUserId();
  const usersQuery = useQuery({ queryKey: USER_LIST_QUERY_KEY, queryFn: () => Users.getUsers() });

  const userList = usersQuery.data ?? NO_USERS;
  const activeUser = userList.find((user) => user.id === activeUserId) ?? userList[0];

  function reloadUserList(): void {
    void usersQuery.refetch();
  }

  return {
    activeUser,
    isLoadingUserList: isLoadingQuery(usersQuery),
    reloadUserList,
    setActiveUser: setActiveUserId,
    userList,
    userListLoadingError: usersQuery.error ?? undefined
  };
}
