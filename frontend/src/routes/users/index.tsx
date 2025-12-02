import UserSearch from '@/components/users/user-search';
import type { components } from '@/lib/api/types';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react';

export const Route = createFileRoute('/users/')({
  component: RouteComponent,
})

type User = components['schemas']['User']

function RouteComponent() {
  const router = useRouter();
  const [selectedUsers] = useState<Set<number>>(new Set());

  const handleUserSelect = (user: User) => {
		router.navigate({to: `/users/${user.id}`})
	};

  return (
      <UserSearch
        selectedUsers={selectedUsers}
        onUserSelect={handleUserSelect}
        kind="user"
      />
  );
}
