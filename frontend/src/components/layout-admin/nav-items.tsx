import { Link, useLocation } from "@tanstack/react-router"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { type SidebarItem } from "./app-sidebar"

export function NavItems({
	items,
	title
}: {
	items: SidebarItem[]
	title: string
}) {
	const location = useLocation()
	return (
		<SidebarGroup>
		<SidebarGroupContent className="flex flex-col gap-2">
			<SidebarGroupLabel>{title}</SidebarGroupLabel>
			<SidebarMenu>
			{items.map((item) => (
				<SidebarMenuItem key={item.title}>
					<SidebarMenuButton tooltip={item.title} asChild className={location.pathname.startsWith(item.url) ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear" : ""}>
						<Link to={item.url}>
						{item.icon && <item.icon />}
						<span>{item.title}</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>
			))}
			</SidebarMenu>
		</SidebarGroupContent>
		</SidebarGroup>
	)
}
