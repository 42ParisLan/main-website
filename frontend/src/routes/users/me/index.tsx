import { createFileRoute } from '@tanstack/react-router'
import MyProfileCard from '@/components/public-users/my-profile/my-profile-card';
import StatsCard from '@/components/public-users/user-profile/stats-card';
import { useAuth } from '@/providers/auth.provider';

export const Route = createFileRoute('/users/me/')({
  component: MyProfileContent,
})

export default function MyProfileContent() {
	const {me} = useAuth();
	
	return (
		<div className="flex-1 flex gap-10 flex-col bg-gradient-to-br from-black to-gray-900">
			<MyProfileCard user={me}/>
			<StatsCard user={me}/>
		</div>
	);
}