import useQueryClient from '@/hooks/use-query-client';
import LoadingPage from '@/components/loading-page';
import { createFileRoute } from '@tanstack/react-router'
import MyProfileCard from '@/components/public-users/my-profile/my-profile-card';
import MyStatsCard from '@/components/public-users/my-profile/my-stats-card';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/home-page/header'
import { Footer } from '@/components/home-page/footer'




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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black to-se1condary">
      <Header/>
      <div className="flex-1 border-0 bg-gradient-to-br from-secondary via-black to-primary">
        <div className="p-6">
          <div className="py-2">
            <MyProfileCard user={user}/>
          </div>
          <div className="pt-2">
            <MyStatsCard user={user}/>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}