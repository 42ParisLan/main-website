

import type { paths } from "@/lib/api/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import createClient, { type OpenapiQueryClient } from "openapi-react-query";
import { createContext, useMemo, useState } from "react";
import { useClient } from "./client.provider";

export const QueryClientContext = createContext<OpenapiQueryClient<
	paths,
	`${string}/${string}`
> | null>(null);

export const ReactQueryClientProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [queryClient] = useState(
		() =>
		new QueryClient({
			defaultOptions: {
				queries: {
					staleTime: 5 * 60 * 1000, // 5 minutes
					retry: (failureCount, error) => {
						// @ts-ignore error:Error
						if ([401, 403, 404].includes(error.status)) return false;
						if (failureCount >= 5) return false;
						return true;
					},
					refetchOnMount: true,
					refetchOnReconnect: true
				},
				mutations: {
					retry: (failureCount, error) => {
						// @ts-ignore error:Error
						if ([401, 403, 404].includes(error.status)) return false;
						if (failureCount >= 2) return false;
						return true;
					},
				}
			},
		}),
	);
	const client = useClient();
	const openApiQueryClient = useMemo(() => {
		return createClient<paths>(client);
	}, [client]);
	return (
		<QueryClientProvider client={queryClient}>
			<QueryClientContext.Provider value={openApiQueryClient}>
				{children}
			</QueryClientContext.Provider>
		</QueryClientProvider>
	);
};
