import ErrorPage from '@/components/error-page';
import LoadingPage from '@/components/loading-page';
import useQueryClient from '@/hooks/use-query-client';
import errorModelToDescription from '@/lib/utils';
import { useAuthentificator } from '@/providers/auth.provider';
import { useClient } from '@/providers/client.provider';
import { createFileRoute, useRouter, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/auth/callback/')({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>) => {
		return {
			code: (search.code as string) || '',
			redirect: (search.redirect as string) || '',
		}
	},
})

function RouteComponent() {
	const [error, setError] = useState<string | null>(null);
	const searchParams = useSearch({ from: '/auth/callback/' });

	const queryClient = useQueryClient();
	const client = useClient();
	const router = useRouter();

	const authenticate = useAuthentificator();

	const { mutate } = queryClient.useMutation(
		"get",
		"/auth/callback",
		{
			onError: (error) => {
				setError(errorModelToDescription(error));
			},
			onSuccess: async () => {
				try {
					const { data: me, error: meError } = await client.GET("/me");
					if (meError) {
						setError(errorModelToDescription(meError));
						return;
					}
					const { data: permissions, error: permissionsError } = await client.GET("/me/permissions");
					if (permissionsError) {
						setError(errorModelToDescription(permissionsError));
						return;
					}

					authenticate({
						me,
						permissions,
					});

					if (searchParams.redirect) {
						const redirectUrl = new URL(searchParams.redirect);
						router.navigate({ to: redirectUrl.pathname });
					}
				} catch (err) {
					console.error("Post-auth error:", err);
					setError("Authentication succeeded but failed to complete setup");
				}
			},
		},
	)

	useEffect(() => {
		const { code, redirect } = searchParams;
		if (!code) {
			setError("No code provided in the URL.");
			return;
		}
		if (!redirect) {
			setError("No redirect URL provided in the URL.");
			return;
		}

		const redirectURI = new URL(window.location.href);
		redirectURI.searchParams.delete("code");
		mutate({
			params: { query: { code, redirect_uri: redirectURI.toString() } },
		});
	}, [mutate, searchParams]);

	if (error) {
		return <ErrorPage error={error} />;
	}

	return <LoadingPage />
}


