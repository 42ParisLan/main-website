import useQueryClient from '@/hooks/use-query-client';
import LoadingPage from '@/components/loading-page';
import { createFileRoute } from '@tanstack/react-router'
import MyProfileCard from '@/components/public-users/my-profile/my-profile-card';
import MyStatsCard from '@/components/public-users/my-profile/my-stats-card';

import { Card, CardContent } from '@/components/ui/card';


export const Route = createFileRoute('/users/me/')({
  component: MyProfileContent,
})

export default function MyProfileContent() {
  const client = useQueryClient();

  const {data: user, isLoading} = client.useQuery("get", "/me")

  if (isLoading || user == undefined) {
    return (
      <LoadingPage/>
    )
  }
  
  return (
    <Card>
      <CardContent>
        <MyProfileCard user={user}/>
        <MyStatsCard user={user}/>
      </CardContent>
    </Card>
  );
}