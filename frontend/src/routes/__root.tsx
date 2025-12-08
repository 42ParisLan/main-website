import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from "sonner"

import AuthProvider from "@/providers/auth.provider";
import ClientProvider from "@/providers/client.provider";
import { ReactQueryClientProvider } from "@/providers/query-client.provider"
import { useEnv } from "@/providers/env.provider";
import { Header } from '@/components/home-page/header';
import { Footer } from "@/components/home-page/footer";

function RootComponent() {
	const { VITE_OAUTH_AUTHORIZE_URL, VITE_OAUTH_CLIENT_ID } = useEnv();
	const { location } = useRouterState();

	const hideHeader = location.pathname.startsWith('/admin') || location.pathname === '/vote/live' || location.pathname === '/auth/callback' || location.pathname === '/terms-of-service' || location.pathname === '/gdpr';
	const hideFooter = location.pathname.startsWith('/admin') || location.pathname === '/vote/live' || location.pathname === '/auth/callback';

	return (
		<>
			<ClientProvider>
				<ReactQueryClientProvider>
						<AuthProvider VITE_OAUTH_AUTHORIZE_URL={VITE_OAUTH_AUTHORIZE_URL} VITE_OAUTH_CLIENT_ID={VITE_OAUTH_CLIENT_ID}>
							<div className="flex flex-col min-h-screen">
								{!hideHeader && <Header />}
								<main className="flex-1">
									<Outlet/>
								</main>
								{!hideFooter && <Footer />}
							</div>
						</AuthProvider>
					<TanStackRouterDevtools />
					<ReactQueryDevtools />
				</ReactQueryClientProvider>
			</ClientProvider>
			<Toaster />
		</>
	)
}


export const Route = createRootRoute({
	component: RootComponent,
})
