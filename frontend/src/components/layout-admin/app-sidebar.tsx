import { useMemo } from "react"
import {
	IconChalkboardTeacher,
	IconChevronLeft,
	IconNotes,
	IconUser,
	IconUserCode,
	IconUsersGroup,
	IconBox,
	IconCrown,
	IconSquareRoundedPlus,
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
	redirect: string
	urlsMatch: string[]
	exceptions?: string[]
	icon?: Icon
	role?: string
	childs?: SidebarItem[]
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
				redirect: "/admin/votes",
				urlsMatch: ["/admin/votes/"],
				icon: IconNotes,
			},
		],
	},
	{
		title: "Tournaments",
		items: [
			{
				title: "Tournaments",
				redirect: "/admin/tournaments",
				urlsMatch: ["/admin/tournaments/"],
				icon: IconUsersGroup,
			},
			{
				title: "Create Tournament",
				redirect: "/admin/tournaments/create/",
				urlsMatch: ["/admin/tournaments/create/"],
				icon: IconSquareRoundedPlus,
				role: "tournament_admin"
			},
			{
				title: "Tournament",
				redirect: "/admin/tournaments",
				urlsMatch: [],
				icon: IconCrown,
				childs: [
					{
						title: "View",
						redirect: "/admin/tournaments/$tournamentid/",
						urlsMatch: ["/admin/tournaments/*/", "/admin/tournaments/*/edit/"],
						exceptions: ["/admin/tournaments/create/"],
						icon: IconUsersGroup,
					},
					{
						title: "Teams",
						redirect: "/admin/tournaments/$tournamentid/teams/",
						urlsMatch: ["/admin/tournaments/*/teams/"],
						icon: IconUsersGroup,
					}
				]
			},
		],
	},
	{
		title: "Users",
		items: [
			{
				title: "Users",
				redirect: "/admin/users",
				urlsMatch: ["/admin/users/"],
				icon: IconUser,
			},
			{
				title: "Admins",
				redirect: "/admin/admins",
				urlsMatch: ["/admin/admins/"],
				icon: IconUserCode,
				role: "super_admin"
			},
		],
	},
	{
		title: "Apps",
		items: [
			{
				title: "My Apps",
				redirect: "/admin/apps/me",
				urlsMatch: ["/admin/apps/me/"],
				icon: IconBox,
				role: "super_admin"
			},
			{
				title: "All Apps",
				redirect: "/admin/apps",
				urlsMatch: ["/admin/apps/"],
				icon: IconBox,
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
