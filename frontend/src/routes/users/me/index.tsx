import { createFileRoute } from '@tanstack/react-router'
import MyProfileCard from '@/components/public-users/my-profile/my-profile-card';
import MyStatsCard from '@/components/public-users/my-profile/my-stats-card';
import { useAuth } from '@/providers/auth.provider';

export const Route = createFileRoute('/users/me/')({
  component: MyProfileContent,
})

export default function MyProfileContent() {
	const {me} = useAuth();
	
	return (
		<div className=" flex flex-col p-10 gap-10 double-gradient">
			<MyProfileCard user={me}/>
			<MyStatsCard/>
		</div>
	);
}