import ErrorPage from "@/components/error-page";
import SearchInput from "@/components/ui/search-input";
import AppList, { AppListSkeleton } from "@/components/apps/app-list";
import { errorModelToDescription } from "@/lib/utils";
import useDelayedState from "@/hooks/use-delayed-state";
import useUrlState from "@/hooks/use-url-state";
import useQueryClient from "@/hooks/use-query-client";

export default function AppSearch() {
	const client = useQueryClient();
	const [query, setQuery] = useUrlState("query", "");
	const delayedQuery = useDelayedState(query);
	const { data: apps, error } = client.useQuery("get", "/apps", {
		params: {
		query: {
			query: delayedQuery,
			limit: 50,
		},
		},
	});

	if (error) {
		return <ErrorPage error={errorModelToDescription(error)} />;
	}

	return (
		<div className="p-4">
			<SearchInput value={query} onUpdate={setQuery} className="mt-4 w-64" />
			<div className="mt-4">
				{apps !== undefined ? <AppList apps={apps.items || []} /> : <AppListSkeleton />}
			</div>
		</div>
	);
}
