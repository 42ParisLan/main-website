import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useQueryClient from '@/hooks/use-query-client';
import { useCallback, useState } from 'react';
import { PaginatedListControlled } from '@/components/ui/paginated-list';
import type { components } from '@/lib/api/types';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/home-page/header';
import { Footer } from '@/components/home-page/footer';
import TeamCard from '@/components/tournaments/teams/team-card';


export const Route = createFileRoute('/tournaments/$tournamentid/teams/')({
  component: RouteComponent,
})

function RouteComponent() {
	const client = useQueryClient();
	const [page, setPage] = useState(0);
	const [limit] = useState(10);
	const [query, setQuery] = useState<string | undefined>("")

	const { data, isLoading } = client.useQuery("get", "/users", {
		params: {
			query: {
				kind: "admin",
				page,
				limit,
				query : query?.trim().toLocaleLowerCase()
			}
		}
	})

	const handlePageChange = useCallback((newPage: number) => {
		setPage(newPage);
	}, []);

	return (
		<>
      <div className="min-h-screen flex flex-col">
        <Header/>
        <div className="flex-1 bg-gradient-to-br from-black via-foreground to-gray-700">
          <div className="">
            <div className="p-4 flex flex-row items-center justify-between space-y-0 gap-4">
              <div className="text-white text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                Teams
              </div>
              <div className="text-gray-400 w-full max-w-sm ml-auto">
                <Input
                  placeholder="Search teams..."
                  value={query ?? ""}
                  onChange={(e) => {
                    setQuery(e.target.value || undefined);
                    setPage(0);
                  }}
                  
                  className="!ring-0 !outline-none"
                  />
              </div>
            </div>
            <div className="p-4">
              <PaginatedListControlled<components['schemas']['User']>
                data={data}
                isLoading={isLoading}
                page={page}
                onPageChange={handlePageChange}
                renderItem={(user) => <TeamCard user={user} />}
                getItemKey={(user) => user.id}
                itemsContainerClassName="grid grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-5 gap-5"
                itemLabel="user"
                emptyMessage="No team found"
                />
            </div>
          </div>
        </div>
        <Footer/>
      </div>
		</>
	)
}