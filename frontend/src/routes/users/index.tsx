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
		<div className="flex flex-col min-h-screen dark bg-background">
			<div className="container mx-auto px-4 lg:px-6 py-12 flex-1">
				<div className="max-w-4xl mx-auto">
					<div className="mb-8">
						<h1 className="text-4xl md:text-5xl font-bold text-center mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
							Find Players
						</h1>
						<p className="text-center text-muted-foreground text-lg">
							Search and discover players from 42
						</p>
					</div>
					<UserSearch
						selectedUsers={selectedUsers}
						onUserSelect={handleUserSelect}
						kind="user"
					/>
				</div>
			</div>
		</div>
	);
}
