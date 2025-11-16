import { Link, useRouter } from "@tanstack/react-router"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

import { type SidebarItem } from "./app-sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"

export function NavItems({
	items,
	title
}: {
	items: SidebarItem[]
	title: string
}) {
	const [activeMap, setActiveMap] = useState<Record<string, boolean>>({});
	const { state } = useRouter()

	useEffect(() => {
		const currentPathname = state.location?.pathname || ''
		let tempActiveMap: Record<string, boolean> = {}

		const segs = (p?: string) =>
			(p || '')
				.replace(/^\/+|\/+$/g, '')
				.split('/')
				.filter(Boolean)

		const segmentsMatch = (a: string, b: string) => {
			if (a === b) return true
			if (a === '*' || b === '*') return true
			if (a.startsWith('$') || b.startsWith('$')) return true
			return false
		}

		const pathMatchesPattern = (path: string, pattern: string) => {
			const pa = segs(path)
			const pb = segs(pattern)
			if (pa.length !== pb.length) return false
			for (let i = 0; i < pa.length; i++) {
				if (!segmentsMatch(pa[i], pb[i])) return false
			}
			return true
		}

		for (const item of items) {
			let parentActive = item.urlsMatch.some((pattern) =>
				pathMatchesPattern(currentPathname, pattern),
			)
			if (item.childs && item.childs.length > 0) {
				for (const subItem of item.childs) {
					let subActive = subItem.urlsMatch.some((pattern) =>
						pathMatchesPattern(currentPathname, pattern),
					)
					if (subActive && subItem.exceptions) {
						subActive = !subItem.exceptions.some((ex) => pathMatchesPattern(currentPathname, ex))
					}
					tempActiveMap[item.title + subItem.title] = subActive
					if (subActive) parentActive = true
				}
			}
			if (parentActive && item.exceptions) {
				parentActive = !item.exceptions.some((ex) => pathMatchesPattern(currentPathname, ex))
			}
			tempActiveMap[item.title] = parentActive
		}
		setActiveMap(tempActiveMap)
	}, [state.location.pathname, items])

	return (
		<SidebarGroup>
			<SidebarGroupContent className="flex flex-col gap-2">
				<SidebarGroupLabel>{title}</SidebarGroupLabel>
				<SidebarMenu>
				{items.map((item) => {
					if (item.childs && activeMap[item.title]) {
						return (
							<Collapsible
								key={item.title}
								asChild
								defaultOpen={activeMap[item.title]}
								className="group/collapsible"
							>
								<SidebarMenuItem>
									<CollapsibleTrigger asChild>
										<SidebarMenuButton tooltip={item.title}>
											{item.icon && <item.icon />}
											<span>{item.title}</span>
											<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
										</SidebarMenuButton>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<SidebarMenuSub>
										{item.childs?.map((subItem) => (
											<SidebarMenuSubItem key={subItem.title}>
												<SidebarMenuSubButton
													asChild
													className={activeMap[item.title + subItem.title] ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear" : ""}
												>
													<Link to={subItem.redirect}>
														{subItem.icon && <subItem.icon />}
														<span>{subItem.title}</span>
													</Link>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
										))}
										</SidebarMenuSub>
									</CollapsibleContent>
								</SidebarMenuItem>
							</Collapsible>
						)
					} else if (!item.childs) {
						return (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton
									tooltip={item.title}
									asChild
									className={activeMap[item.title] ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear" : ""}
								>
									<Link to={item.redirect}>
										{item.icon && <item.icon />}
										<span>{item.title}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						)
					}
				})}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	)
}
