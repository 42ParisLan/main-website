import InvitationItem from '@/components/invitations/invitation-item';
import { PaginatedListControlled } from '@/components/ui/paginated-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { components } from '@/lib/api/types';

export default function InvitationCard() {
    const [page, setPage] = useState<number>(0);
        const {data: invitations, isError: isErrorInvitations, isLoading: isLoadingInvitations} = client.useQuery("get", "/teams/{id}/invitations", {
            params:{
                path: {
                    id: team?.id ?? 0
                },
                query: {
                    page
                }
            },
            enabled: !!team?.id,
        })
    
        if ((isErrorInvitations || errorTeam) && !errorTournament) {
		router.navigate({to: `/tournaments/$tournamentid`, params: {tournamentid}})
		return null
	}
    return (
        <Card className="w-full border-0 flex-1  bg-gradient-to-br from-black to-gray-700">
            <CardHeader className='flex justify-between'>
                <CardTitle>
                    Invitations
                </CardTitle>
            </CardHeader>
            <CardContent>
                <PaginatedListControlled<components['schemas']['Invitation']>
                    data={invitations}
                    page={page}
                    onPageChange={setPage}
                    isLoading={isLoadingInvitations}
                    renderItem={(item) => (
                        <>
                            <InvitationItem invitation={item} tournamentid={tournament.slug} />
                        </>
                    )}
                    getItemKey={(item) => item.id}
                />
            </CardContent>
        </Card>
    );
}