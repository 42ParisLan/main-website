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
    <div className="flex flex-col min-h-screen dark bg-gradient-to-br from-black to-gray-800">
        <div className="flex flex-1 flex-col gap-8">
          <div  >
            <h3 className="p-4 text-white text-center font-bold text-3xl">Find Users</h3>
          </div>
          <UserSearch
            selectedUsers={selectedUsers}
            onUserSelect={handleUserSelect}
            kind="user"
          />
        </div>
    </div>
  );
}
