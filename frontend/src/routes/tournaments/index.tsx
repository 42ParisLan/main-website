import PublicTournamentCard from '@/components/tournaments/public-tournament-card';
import { PaginatedListControlled } from '@/components/ui/paginated-list';
import useQueryClient from '@/hooks/use-query-client';
import type { components } from '@/lib/api/types';
import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useState } from 'react';
import { Header } from '@/components/home-page/header'
import { Footer } from '@/components/home-page/footer'

export const Route = createFileRoute('/tournaments/')({
    component: RouteComponent,
});

function RouteComponent() {
	const [newPage, setNewPage] = useState<number>(0);
	const [oldPage, setOldPage] = useState<number>(0);
	const client = useQueryClient();

	const { data: NewTournament, isLoading: isLoadingNew } = client.useQuery(
		'get',
		'/tournaments',
		{
			params: {
				query: {
					page: newPage,
					status: 'ongoing',
					limit: 3,
				},
			},
		}
	);

	const { data: OldTournament, isLoading: isLoadingOld } = client.useQuery(
		'get',
		'/tournaments',
		{
			params: {
				query: {
					page: oldPage,
					status: 'finish',
					limit: 3,
				},
			},
		}
	);

	const handleNewPageChange = useCallback((changedPage: number) => {
		setNewPage(changedPage);
	}, []);

	const handleOldPageChange = useCallback((changedPage: number) => {
		setOldPage(changedPage);
	}, []);

	return (
		<div className="container mx-auto p-4 md:p-8">
			<div className="space-y-12">
				<div>
					<h1 className="text-3xl font-bold mb-6 text-center md:text-left">
						Ongoing Tournaments
					</h1>
					<PaginatedListControlled<components['schemas']['LightTournament']>
						data={NewTournament}
						isLoading={isLoadingNew}
						page={newPage}
						onPageChange={handleNewPageChange}
						renderItem={(tournament) => (
							<PublicTournamentCard tournament={tournament} />
						)}
						getItemKey={(tournament) => tournament.id}
						itemsContainerClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
						itemLabel="tournaments"
						emptyMessage="No ongoing tournaments found."
					/>
				</div>
				<div>
					<h1 className="text-3xl font-bold mb-6 text-center md:text-left">
						Past Tournaments
					</h1>
					<PaginatedListControlled<components['schemas']['LightTournament']>
						data={OldTournament}
						isLoading={isLoadingOld}
						page={oldPage}
						onPageChange={handleOldPageChange}
						renderItem={(tournament) => (
							<PublicTournamentCard tournament={tournament} />
						)}
						getItemKey={(tournament) => tournament.id}
						itemsContainerClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
						itemLabel="tournaments"
						emptyMessage="No past tournaments found."
					/>
				</div>
			</div>
		</div>
	);
}
