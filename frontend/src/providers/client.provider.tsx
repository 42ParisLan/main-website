import type { ApiClient } from "@/lib/api/client";
import type { paths } from "@/lib/api/types";
import createClient from "openapi-fetch";
import { createContext, type ReactNode, useContext, useMemo } from "react";


export type ClientContextType = ApiClient;

export const ClientContext = createContext<ClientContextType | null>(null);

export function useClient() {
	const client = useContext(ClientContext);
	if (!client) {
		throw new Error("useClient must be used within a ClientProvider");
	}
	return client;
}

export default function ClientProvider({ children }: { children: ReactNode }) {
	const client = useMemo(() => {
		const apiClient = createClient<paths>({
			baseUrl: "/api",
			credentials: "same-origin",
		});
		return apiClient;
	}, []);

	return (
		<ClientContext.Provider value={client}>{children}</ClientContext.Provider>
	);
}
