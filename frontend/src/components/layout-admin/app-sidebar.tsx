import { useMemo } from "react"
import {
	IconChalkboardTeacher,
	IconChevronLeft,
	IconNotes,
	IconUser,
	IconUserCode,
	IconUsersGroup,
	type Icon,
} from "@tabler/icons-react"

import { NavItems } from "@/components/layout-admin/nav-items"
import { NavUser } from "@/components/layout-admin/nav-user"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link } from "@tanstack/react-router"
import { useAuth } from "@/providers/auth.provider"
import { useHasRole } from "@/hooks/use-can"

export type SidebarThemes = {
	title: string
	items: SidebarItem[]
}

export type SidebarItem = {
	title: string
	url: string
	icon?: Icon
	role?: string
}

interface SidebarData {
	title: string
	items: SidebarItem[]
}

const data: SidebarData[] = [
	{
		title: "Votes",
		items: [
			{
				title: "Votes",
				url: "/admin/votes",
				icon: IconNotes,
				role: "vote_admin"
			},
		],
	},
	{
		title: "Teams",
		items: [
			{
				title: "Teams",
				url: "/admin/teams",
				icon: IconUsersGroup,
				role: "team_admin"
			},
		],
	},
	{
		title: "Users",
		items: [
			{
				title: "Users",
				url: "/admin/users",
				icon: IconUser,
				role: "super_admin"
			},
			{
				title: "Admins",
				url: "/admin/admins",
				icon: IconUserCode,
				role: "super_admin"
			},
		],
	}
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { me } = useAuth();
	const hasRole = useHasRole();

	const filteredData = useMemo(
		() =>
			data
				.map((group) => ({
					...group,
					items: group.items.filter((item) => !item.role || hasRole([item.role])),
				}))
				.filter((group) => group.items.length > 0),
		[hasRole]
	);

	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<Link to="/admin">
								<IconChalkboardTeacher className="!size-5" />
								<span className="text-base font-semibold">Admin Dashboard</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							size="sm"
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<Link to="/">
								<IconChevronLeft className="!size-4" />
								<span className="text-sm">Back to public Website</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				{filteredData.map((group) => (
					<NavItems key={group.title} items={group.items} title={group.title} />
				))}
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={me} />
			</SidebarFooter>
		</Sidebar>
	)
}
