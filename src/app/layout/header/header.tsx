import { ActiveUser } from '../active-user/active-user';
import { CONVERSATIONS_URL } from '../../core/config/routes.config';
import Image from 'next/image';
import Link from 'next/link';
import { ThemeToggle } from '../theme-toggle/theme-toggle';
import { UserSelector } from '../user-selector/user-selector';

export function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-4">
      <Link href={CONVERSATIONS_URL} title="Back to home" className="flex shrink-0 items-center">
        <Image src="/leboncoin-logo.svg" alt="leboncoin" width={164} height={30} className="h-5 w-auto sm:h-7" loading="eager" />
      </Link>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 pl-3 sm:gap-3">
        <ThemeToggle />
        <ActiveUser />
        <UserSelector />
      </div>
    </header>
  );
}
