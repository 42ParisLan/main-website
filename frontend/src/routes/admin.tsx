import { createFileRoute, Outlet, useRouter } from '@tanstack/react-router'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout-admin/app-sidebar'
import { SiteHeader } from '@/components/layout-admin/site-header'
import * as React from 'react'
import { useHasRole } from '@/hooks/use-can'

export const Route = createFileRoute('/admin')({
  component: DashLayout,
})

function DashLayout() {
	const hasRole = useHasRole();
	const router = useRouter();

	if (!hasRole(["admin", "super-admin"])) {
		router.navigate({ to: "/"});
	}

	return (
		<SidebarProvider
			style={{
				"--sidebar-width": "calc(var(--spacing) * 72)",
				"--header-height": "calc(var(--spacing) * 12)",
				"--content-height": "calc(100vh - var(--header-height) - 16px)"
			} as React.CSSProperties}
			className='dark'
		>
			<AppSidebar variant="inset" className='dark'/>
			<SidebarInset className="light">
				<SiteHeader />
				<div className="flex flex-1 flex-col">
					<div className="@container/main flex flex-1 flex-col gap-2">
						<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 h-full">
							<Outlet/>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
