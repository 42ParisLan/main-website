import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PaginatedListControlled } from '@/components/ui/paginated-list';
import useQueryClient from '@/hooks/use-query-client';
import { createFileRoute } from '@tanstack/react-router'
import {type components} from "@/lib/api/types"
import { useCallback, useState } from 'react';
import { TeamCard } from '@/components/tournaments/admin/teams-card';
import { useHasRole } from '@/hooks/use-can';
import { useAuth } from '@/providers/auth.provider';

export const Route = createFileRoute('/admin/tournaments/$tournamentid/teams/')({
  component: RouteComponent,
})

function RouteComponent() {
	const { tournamentid } = Route.useParams();
	const [page, setPage] = useState(0);
	const client = useQueryClient();
	const hasRole = useHasRole();
	const {me} = useAuth();

	const {data: teams, isLoading} = client.useQuery("get", "/tournaments/{id}/teams", {
		params: {
			path: {
				id: Number(tournamentid)
			},
			query: {
				page
			}
		}
	})

	const {data: tournament} = client.useQuery("get", "/tournaments/{id_or_slug}", {
		params:{
			path: {
				id_or_slug: tournamentid
			}
		}
	})

	const handlePageChange = useCallback((newPage: number) => {
		setPage(newPage)
	}, [])

	let role = tournament?.admins?.find((admin) => admin.user.id === me?.id)?.role
	if (!role && hasRole(['super_admin'])) {
		role = "CREATOR"
	}

	return (
		<>
			<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
				<Card className="@container/card">
					<CardHeader>
						<CardTitle>
							Teams for tournament
						</CardTitle>
					</CardHeader>
					<CardContent>
						<PaginatedListControlled<components['schemas']['LightTeam']>
							data={teams}
							page={0}
							onPageChange={handlePageChange}
							isLoading={isLoading}
							itemsContainerClassName="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5"
							renderItem={(team) => <TeamCard team={team}/>}
							emptyMessage='No Teams for the moment'
							getItemKey={(item) => item.id}
						/>
					</CardContent>
				</Card>
			</div>
		</>
	)
}
