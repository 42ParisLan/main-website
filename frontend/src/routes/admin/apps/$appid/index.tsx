import AppDisplay from '@/components/apps/app/app-display';
import ErrorPage from '@/components/error-page';
import LoadingPage from '@/components/loading-page';
import useQueryClient from '@/hooks/use-query-client';
import errorModelToDescription from '@/lib/utils';
import { createFileRoute } from '@tanstack/react-router';
import { ChevronLeftIcon } from 'lucide-react';

export const Route = createFileRoute('/admin/apps/$appid/')({
  component: RouteComponent,
})

function RouteComponent() {
	const client = useQueryClient();
	const { appid } = Route.useParams();

	if (!appid) {
		return (
		<ErrorPage error="App ID is required. Please provide a valid app ID in the URL." />
		);
	}

	const { data: app, error: appError } = client.useQuery("get", "/apps/{id}", {
		params: {
			path: {
				id: appid,
			},
		},
	});

	if (appError) {
		return <ErrorPage error={errorModelToDescription(appError)} />;
	}

	if (!app) {
		return <LoadingPage />;
	}

	return (
		<>
			<a
				href="/admin/apps/me"
				className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-md"
				aria-label="Go to my apps"
			>
				<ChevronLeftIcon className="w-4 h-4" />
				<span>My apps</span>
			</a>
			<AppDisplay initialAppData={app} />
		</>
	)
}
