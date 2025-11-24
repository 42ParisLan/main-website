import AppList from '@/components/apps/app-list';
import AppCreateButton from '@/components/apps/app/app-create-button';
import ConsentList from '@/components/apps/consent-list';
import ErrorPage from '@/components/error-page';
import LoadingPage from '@/components/loading-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useQueryClient from '@/hooks/use-query-client';
import errorModelToDescription from '@/lib/utils';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/apps/me/')({
  component: RouteComponent,
})

function RouteComponent() {
	const client = useQueryClient();
	const { data: apps, error: appError } = client.useQuery("get", "/me/apps");

	const { data: consents, error: consentError } = client.useQuery(
		"get",
		"/me/consents",
	);

	if (consentError) {
		return <ErrorPage error={errorModelToDescription(consentError)} />;
	}

	if (appError) {
		return <ErrorPage error={errorModelToDescription(appError)} />;
	}

	if (!apps || !consents) {
		return <LoadingPage />;
	}

	return (
		<>
			<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
				<Card className="@container/card">
					<CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
								My Apps
							</CardTitle>
							<p className="mt-1 text-gray-500">You can manage your apps here.</p>
						</div>
						<div className="flex items-center">
							<AppCreateButton />
						</div>
					</CardHeader>
					<CardContent>
						<AppList apps={apps.items || []} />
					</CardContent>
				</Card>
				<Card className="@container/card">
					<CardHeader className="flex flex-col items-start sm:justify-between gap-4">
						<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
							My App Authorization
						</CardTitle>
						<p className="mt-1 text-gray-500">This is a list of apps that you have authorized to access your
						account.</p>
					</CardHeader>
					<CardContent>
						<ConsentList consents={consents.items || []} />
					</CardContent>
				</Card>
			</div>
		</>
	);
}
