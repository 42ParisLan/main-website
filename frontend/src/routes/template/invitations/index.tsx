import InvitationItem from '@/components/invitations/invitation-item';
import { PaginatedListControlled } from '@/components/ui/paginated-list';
import useQueryClient from '@/hooks/use-query-client'
import type { components } from '@/lib/api/types';
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';

export const Route = createFileRoute('/template/invitations/')({
  component: RouteComponent,
})

function RouteComponent() {
	const client = useQueryClient();

	const [page, setPage] = useState<number>(0);

	const {data: invitations, isError: isErrorInvitations, isLoading: isLoadingInvitations} = client.useQuery("get", "/me/invitations")

	if (isErrorInvitations) {
		return (<p>Invitation failed</p>)
	}

	return (
		<>
			<PaginatedListControlled<components['schemas']['Invitation']>
				data={invitations}
				page={page}
				onPageChange={setPage}
				isLoading={isLoadingInvitations}
				renderItem={(item) => (
					<>
						<InvitationItem invitation={item} tournamentid={undefined} />
					</>
				)}
				getItemKey={(item) => item.id}
			/>
		</>
	)
}
