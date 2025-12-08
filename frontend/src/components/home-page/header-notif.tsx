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
import useQueryClient from "@/hooks/use-query-client"
import InvitationItem from "@/components/invitations/invitation-item"

export function HeaderNotifs() {
	const client = useQueryClient();

	const { data: invitations, isError, isLoading } = client.useQuery("get", "/me/invitations")

	const items = (invitations as any)?.items ?? invitations ?? []
	const count = Array.isArray(items) ? items.length : 0

	if (isError) {
		return (<p>Invitation failed</p>)
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="transparent"
					className="relative p-2 h-auto w-auto rounded-full text-gray-200 hover:text-white focus-visible:ring-2 ring-primary/40"
					aria-label="Notifications"
				>
					<Bell className="size-5" />
					{count > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] leading-none rounded-full"
						>
							{count}
						</Badge>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80 dark bg-card border border-border/60 z-[1001]">
				<DropdownMenuLabel className="flex items-center justify-between">
					<span>Invitations</span>
					{count > 0 && <Badge variant="outline">{count}</Badge>}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{isLoading && (
					<DropdownMenuItem className="opacity-70">Loading…</DropdownMenuItem>
				)}
				{!isLoading && count === 0 && (
					<DropdownMenuItem className="opacity-70">No invitations</DropdownMenuItem>
				)}
				{!isLoading && count > 0 && (
					<div className="flex flex-col max-h-72 overflow-auto">
						{items.slice(0, 5).map((inv: any) => (
							<div key={inv.id} className="px-1">
								<InvitationItem invitation={inv} tournamentid={inv?.team?.tournament?.slug ?? undefined} compact />
							</div>
						))}
					</div>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}