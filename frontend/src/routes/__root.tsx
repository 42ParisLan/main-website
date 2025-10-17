import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from "sonner"

import AuthProvider from "@/providers/auth.provider";
import ClientProvider from "@/providers/client.provider";
import { ReactQueryClientProvider } from "@/providers/query-client.provider"
import { useEnv } from "@/providers/env.provider";

function RootComponent() {
	const { VITE_OAUTH_AUTHORIZE_URL, VITE_OAUTH_CLIENT_ID } = useEnv();

	return (
		<>
			<ClientProvider>
				<ReactQueryClientProvider>
						<AuthProvider VITE_OAUTH_AUTHORIZE_URL={VITE_OAUTH_AUTHORIZE_URL} VITE_OAUTH_CLIENT_ID={VITE_OAUTH_CLIENT_ID}>
							<Outlet/>
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
