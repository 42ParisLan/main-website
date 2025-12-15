import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "@tanstack/react-router"
import { useMemo, useState } from "react"
import type { components } from "@/lib/api/types"
import { useSSE } from "@/hooks/use-sse"
import InvitationItem from "@/components/invitations/invitation-item"
import NotificationItem from "@/components/notifications/notification-item"

export function HeaderNotifs() {
	const [notifications, setNotifications] = useState<components["schemas"]["Notification"][]>([])
	const [invitationItems, setInvitationItems] = useState<components["schemas"]["Invitation"][]>([])

	const invitationsCount = useMemo(() => invitationItems.length, [invitationItems])

	const { error } = useSSE<"/me/notifications/live">("/me/notifications/live", {
		message: (data) => {
			setNotifications((prev) => {
				const next = [data, ...prev]
				const seen = new Set<number>()
				const deduped = next.filter((notif) => {
					if (seen.has(notif.id)) return false
					seen.add(notif.id)
					return true
				})
				return deduped.slice(0, 50)
			})
		}
	})

	const { error: invitationsLiveError } = useSSE<"/me/invitations/live">("/me/invitations/live", {
		message: (data) => {
			setInvitationItems((prev) => {
				const next = [data as any, ...prev]
				const seen = new Set<number>()
				const deduped = next.filter((inv: any) => {
					if (seen.has(inv.id)) return false
					seen.add(inv.id)
					return true
				})
				return deduped.slice(0, 50)
			})
		},
	})

	const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])
	const notificationsCount = useMemo(() => notifications.length, [notifications])
	const totalBadgeCount = invitationsCount + unreadCount

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="transparent"
					className="relative p-2 h-auto w-auto rounded-full text-gray-200 hover:text-white focus-visible:ring-2 ring-primary/40"
					aria-label="Notifications"
				>
					<Bell className="size-5" />
					{totalBadgeCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] leading-none rounded-full"
						>
							{totalBadgeCount}
						</Badge>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80 dark bg-card border border-border/60 z-[1001]">
				<DropdownMenuLabel className="flex items-center justify-between">
					<span>Invitations</span>
					{invitationsCount > 0 && <Badge variant="outline">{invitationsCount}</Badge>}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{invitationsCount === 0 && (
					<DropdownMenuItem className="opacity-70">No invitations</DropdownMenuItem>
				)}
				{invitationsCount > 0 && (
					<div className="flex flex-col max-h-72 overflow-auto">
						{invitationItems.slice(0, 3).map((inv: any) => (
							<div key={inv.id} className="px-1">
								<InvitationItem invitation={inv} tournamentid={inv?.team?.tournament?.slug ?? undefined} compact />
							</div>
						))}
						{invitationsCount > 3 && (
							<div className="px-1 py-2">
								<Link
									to={"/users/me/notifs"}
									className="text-xs text-primary hover:text-primary/80 underline"
								>
									View all {invitationsCount} invitations
								</Link>
							</div>
						)}
					</div>
				)}
				<DropdownMenuSeparator />
				<DropdownMenuLabel className="flex items-center justify-between">
					<span>Notifications</span>
					{notificationsCount > 0 && (
						<div className="flex items-center gap-1">
							<Badge variant="outline">{notificationsCount}</Badge>
							{unreadCount > 0 && <Badge variant="destructive">{unreadCount} new</Badge>}
						</div>
					)}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{notificationsCount === 0 && (
					<DropdownMenuItem className="opacity-70">No notifications</DropdownMenuItem>
				)}
				{notificationsCount > 0 && (
					<div className="flex flex-col max-h-72 overflow-auto">
						{notifications.slice(0, 20).map((notif) => (
							<DropdownMenuItem key={notif.id} asChild>
								<div>
									<NotificationItem 
										notification={notif} 
										compact 
										onMarkRead={(id) => {
											setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
										}}
									/>
								</div>
							</DropdownMenuItem>
						))}
					</div>
				)}
				<DropdownMenuSeparator />
				<Button
					variant="link"
				>
					<Link
						to={"/users/me/notifs"}
					>
						See all notifications and invitations
					</Link>
				</Button>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}