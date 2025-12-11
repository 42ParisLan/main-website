import TournamentEdit from '@/components/tournaments/admin/tournament-edit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useHasRole } from '@/hooks/use-can';
import useQueryClient from '@/hooks/use-query-client';
import errorModelToDescription from '@/lib/utils';
import { useAuth } from '@/providers/auth.provider';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/tournaments/$tournamentid/edit/')({
  component: RouteComponent,
})

function RouteComponent() {
	const {tournamentid} = Route.useParams();
	const router = useRouter();
	const {me} = useAuth();
	const hasRole = useHasRole()

	const client = useQueryClient();

	const {data, isLoading, isError} = client.useQuery("get", "/tournaments/{id_or_slug}", {
		params:{
			path: {
				id_or_slug: tournamentid
			}
		}
	})

	const {mutate: mutateDelete} = client.useMutation("delete", "/tournaments/{id}", {
		onError: (error) => {
			const erorrDescription = errorModelToDescription(error)
			console.error(erorrDescription);
			toast.error("Failed to delete Tournament")
		},
		onSuccess: () => {
			toast.success("Tournament Successfuly Deleted")
			router.navigate({to: "/admin/tournaments"})
		}
	})

	const performDelete = useCallback(() => {
		if (!data) return;
		mutateDelete({
			params: {
				path: {
					id: data.id,
				},
			},
		});
	}, [mutateDelete, data]);

	
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [endTournamentOpen, setEndTournamentOpen] = useState(false);

	const {mutate: mutateEnd, isPending: isEndingTournament} = client.useMutation("post", "/tournaments/{id}/end", {
		onError: (error) => {
			const errorDescription = errorModelToDescription(error)
			console.error(errorDescription);
			toast.error("Failed to end tournament", {
				description: errorDescription,
			})
		},
		onSuccess: () => {
			toast.success("Tournament ended successfully")
			setEndTournamentOpen(false)
			router.navigate({to: "/admin/tournaments/$tournamentid", params: {tournamentid}})
		}
	})

	const handleEndTournament = useCallback(() => {
		if (!data) return;
		mutateEnd({
			params: {
				path: {
					id: data.id,
				},
			},
		});
	}, [mutateEnd, data]);

	const handleDeleteTournament = useCallback(() => {
		if (!data) return;

		setConfirmOpen(true);
		performDelete();
	}, [data, performDelete]);

	if (isLoading) {
		return <div className="text-sm text-muted-foreground">Loading tournament…</div>
	}

	if (isError) {
		router.navigate({to: '/admin/tournaments'})
		return
	}

	if (data) {
		let role = data.admins?.find((admin) => admin.user.id === me?.id)?.role
		if (!role && hasRole(['super_admin'])) {
			role = "CREATOR"
		}
		if (!role || role == "ADMIN") {
			router.navigate({to: '/admin/tournaments/$tournamentid', params:{tournamentid}})
			return
		}
		return (
			<>
				<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
					<Card className="@container/card">
						<CardHeader>
							<CardTitle>
								Update {data.name}
							</CardTitle>
							<div className="flex gap-2">
								{(role == "CREATOR") && (
									<>
										<Button
											size="sm" 
											variant="outline"
											onClick={() => setEndTournamentOpen(true)}
										>
											End Tournament
										</Button>
										<Button
											size="sm" 
											variant="destructive"
											onClick={handleDeleteTournament}
										>
											Delete
										</Button>
									</>
								)}
							</div>
						</CardHeader>
						<CardContent>
							<TournamentEdit tournament={data}/>
						</CardContent>
					</Card>
				</div>
				{/* Confirmation dialog for ending tournament */}
				<Dialog open={endTournamentOpen} onOpenChange={setEndTournamentOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>End Tournament</DialogTitle>
							<DialogDescription>
								Before ending this tournament, please verify the following:
							</DialogDescription>
						</DialogHeader>
						<div className="py-4">
							<ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
								<li>All matches have been completed and results recorded</li>
								<li>Final rankings have been reviewed and confirmed</li>
								<li>All team disputes or issues have been resolved</li>
								<li>Winner(s) have been properly identified</li>
								<li>Elo ratings and statistics are ready to be finalized</li>
							</ul>
							<p className="mt-4 text-sm font-medium text-foreground">
								This action will finalize the tournament. Continue?
							</p>
						</div>
						<DialogFooter>
							<Button type="button" variant="ghost" onClick={() => setEndTournamentOpen(false)}>Cancel</Button>
							<Button type="button" onClick={handleEndTournament} disabled={isEndingTournament}>
								{isEndingTournament ? "Ending..." : "End Tournament"}
							</Button>
						</DialogFooter>
						<DialogClose />
					</DialogContent>
				</Dialog>

				{/* Confirmation dialog for deleting visible tournaments */}
				<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete tournament</DialogTitle>
							<DialogDescription>
								This tournament is currently visible to users. Deleting it will remove it and all related data — this action cannot be undone. Are you sure you want to continue?
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button type="button" variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
							<Button type="button" variant="destructive" onClick={() => { performDelete(); setConfirmOpen(false); }}>Delete</Button>
						</DialogFooter>
						<DialogClose />
					</DialogContent>
				</Dialog>
			</>
		)
	}
}
