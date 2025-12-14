import { createFileRoute } from '@tanstack/react-router'
import useQueryClient from '@/hooks/use-query-client'
import { useState, useCallback } from 'react'
import { PaginatedListControlled } from '@/components/ui/paginated-list'
import InvitationItem from '@/components/invitations/invitation-item'
import type { components } from '@/lib/api/types'

export const Route = createFileRoute('/users/me/invitations/')({
	component: RouteComponent,
})

function RouteComponent() {
	const [page, setPage] = useState<number>(0)
	const client = useQueryClient()

	const { data, isLoading } = client.useQuery('get', '/me/invitations', {
		params: {
			query: {
				page,
			},
		},
	})

	const handlePageChange = useCallback((newPage: number) => {
		setPage(newPage)
	}, [])

	return (
		<div className="min-h-screen flex flex-col dark bg-gradient-to-br from-black to-gray-800">
			<div className="flex flex-1">
				<div className="w-full p-4">
					<div className="text-white p-4">
						<h1 className="text-3xl font-bold mb-6">My Invitations</h1>
					</div>

					<PaginatedListControlled<components['schemas']['Invitation']>
						data={data}
						isLoading={isLoading}
						page={page}
						onPageChange={handlePageChange}
						renderItem={(invitation) => (
							<InvitationItem
								invitation={invitation}
							/>
						)}
						getItemKey={(invitation) => invitation.id}
						itemsContainerClassName="flex flex-col gap-4"
						itemLabel="invitation"
						emptyMessage="No invitations at the moment"
						loadingComponent={<div className="text-center py-12">Loading invitations...</div>}
					/>
				</div>
			</div>
		</div>
	)
}
