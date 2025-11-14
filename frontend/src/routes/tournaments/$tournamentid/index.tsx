import { Button } from '@/components/ui/button'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { Header } from '@/components/home-page/header'
import { useState } from 'react';
import UserSearch from '@/components/users/user-search';
import type { components } from '@/lib/api/types';

export const Route = createFileRoute('/tournaments/$tournamentid/')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter();
    const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  
    const handleUserSelect = (user: User) => {
      router.navigate({to: `/users/${user.id}`})
    };
  return (
    <div>
      <Header/>
      <div className="flex justify-center min-h-screen bg-background pt-20">
				<div className="flex items-center flex-col gap-4">
          <div>
            	<Button 
                type="button"
                variant="outline"
                className="min-w-[140px]"
                onClick={() => (window.location.href = "/tournaments/1/register")}
                >
                Register
            </Button>
          </div>
          <div>
            <Button 
              type="button"
              variant="outline"
              className="min-w-[140px]"
              onClick={() => (window.location.href = "/tournaments/1/teams")}
              >
              Teams
            </Button>
          </div>
				</div>
			</div>
    </div>
  );
}
