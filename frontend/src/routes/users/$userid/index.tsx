import { Card, CardContent } from '@/components/ui/card';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import useQueryClient from '@/hooks/use-query-client';
import LoadingPage from '@/components/loading-page';
import { useAuth } from '@/providers/auth.provider';

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

  if (isLoading || user == undefined) {
    return (
      <LoadingPage/>
    )
  }

  if (user.id == me.id) {
    router.navigate({to :"/users/me"})
  }

  return (
    <div>
      <Card>
        <CardContent>
          <div><p>test</p></div>
        </CardContent>
      </Card>
    </div>
  );
}