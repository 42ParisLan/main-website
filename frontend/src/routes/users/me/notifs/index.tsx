import { createFileRoute } from '@tanstack/react-router'
import useQueryClient from '@/hooks/use-query-client'
import { useState, useCallback } from 'react'
import { PaginatedListControlled } from '@/components/ui/paginated-list'
import InvitationItem from '@/components/invitations/invitation-item'
import NotificationItem from '@/components/notifications/notification-item'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { components } from '@/lib/api/types'

export const Route = createFileRoute('/users/me/notifs/')({
	component: RouteComponent,
})

function RouteComponent() {
	const [invitationsPage, setInvitationsPage] = useState<number>(0)
	const [notificationsPage, setNotificationsPage] = useState<number>(0)
	const [notificationFilter, setNotificationFilter] = useState<'all' | 'read' | 'unread'>('all')
	const client = useQueryClient()

	const { data: invitationsData, isLoading: isLoadingInvitations } = client.useQuery('get', '/me/invitations', {
		params: {
			query: {
				page: invitationsPage,
			},
		},
	})

	const { data: notificationsData, isLoading: isLoadingNotifications } = client.useQuery('get', '/me/notifications', {
		params: {
			query: {
				page: notificationsPage,
				status: notificationFilter,
			},
		},
	})

	const handleInvitationsPageChange = useCallback((newPage: number) => {
		setInvitationsPage(newPage)
	}, [])

	const handleNotificationsPageChange = useCallback((newPage: number) => {
		setNotificationsPage(newPage)
	}, [])

	return (
		<div className="h-full flex flex-col dark bg-gradient-to-br from-black to-gray-800">
			<div className="flex flex-1">
				<div className="w-full p-4">
					<div className="text-white p-4">
						<h1 className="text-3xl font-bold mb-6">My Invitations & Notifications</h1>
					</div>

					<div className="space-y-8">
						<div>
							<h2 className="text-white text-2xl font-semibold mb-4">Invitations</h2>
							<PaginatedListControlled<components['schemas']['Invitation']>
								data={invitationsData}
								isLoading={isLoadingInvitations}
								page={invitationsPage}
								onPageChange={handleInvitationsPageChange}
								renderItem={(invitation) => (
									<InvitationItem
										invitation={invitation}
									/>
								)}
								getItemKey={(invitation) => invitation.id}
								itemsContainerClassName="flex flex-col gap-4"
								itemLabel='invitation'
								emptyMessage="No invitations at the moment"
								loadingComponent={<div className="text-center py-12">Loading invitations...</div>}
							/>
						</div>

						<div>
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-white text-2xl font-semibold">Notifications</h2>
							<Tabs value={notificationFilter} onValueChange={(value) => setNotificationFilter(value as 'all' | 'read' | 'unread')}>
								<TabsList>
									<TabsTrigger value="all">All</TabsTrigger>
									<TabsTrigger value="unread">Unread</TabsTrigger>
									<TabsTrigger value="read">Read</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>
							<PaginatedListControlled<components['schemas']['Notification']>
							data={notificationsData}
								isLoading={isLoadingNotifications}
								page={notificationsPage}
								onPageChange={handleNotificationsPageChange}
								renderItem={(notification) => (
									<NotificationItem
										notification={notification}
									/>
								)}
								getItemKey={(notification) => notification.id}
								itemsContainerClassName="flex flex-col gap-4"
								itemLabel='notification'
								emptyMessage="No notifications at the moment"
								loadingComponent={<div className="text-center py-12">Loading notifications...</div>}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
