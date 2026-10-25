import { CONVERSATIONS_URL } from '../src/app/core/config/routes.config';
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect(CONVERSATIONS_URL);
}
