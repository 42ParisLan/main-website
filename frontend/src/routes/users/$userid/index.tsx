import { createFileRoute, useRouter } from '@tanstack/react-router'
import useQueryClient from '@/hooks/use-query-client';
import LoadingPage from '@/components/loading-page';
import { useAuth } from '@/providers/auth.provider';
import ProfileCard from '@/components/public-users/user-profile/profile-card';
import MyStatsCard from '@/components/public-users/my-profile/my-stats-card';

export const Route = createFileRoute('/users/$userid/')({
	component: ProfileContent,
})

export default function ProfileContent() {
	const { userid } = Route.useParams();
	const client = useQueryClient();
	const router = useRouter();
	const {me} = useAuth();

	const {data: user, error: errorUser, isLoading} = client.useQuery("get", "/users/{id_or_login}", {
			params: {
				path: {
					id_or_login: userid
				}
			}
		})

	if (errorUser) {
		router.navigate({to: "/users"})
	}

	if (isLoading) {
		return (
		<LoadingPage/>
		)
	}

	if (user?.id == me.id) {
		router.navigate({to :"/users/me"})
	}

	return (
		<div className="flex-1 flex gap-10 flex-col bg-gradient-to-br from-black to-gray-900">
			<ProfileCard user={me}/>
			<MyStatsCard/>
		</div>
	);
}