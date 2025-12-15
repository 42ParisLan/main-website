import { useState } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import errorModelToDescription from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from '@tanstack/react-router';
import useQueryClient from '@/hooks/use-query-client';

export default function TeamActionsCard({
  team,
	tournament,
}: {
	team: { id: number; name: string; is_locked: boolean };
	tournament: { slug: string };
}) {
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [lockDialogOpen, setLockDialogOpen] = useState(false);
	const client = useQueryClient();
	const router = useRouter();

	// Delete mutation
	const { mutate: mutateDelete, isPending: isDeleting } = client.useMutation("delete", "/teams/{id}", {
		onSuccess() {
			toast.success("Team Successfully deleted");
			if (tournament) {
				router.navigate({
					to: "/tournaments/$tournamentid",
					params: { tournamentid: tournament.slug },
				});
			}
		},
		onError(error) {
			const errorMessage = errorModelToDescription(error);
			toast.error(`Error while deleting team: ${errorMessage}`);
		},
	});

	// Lock mutation
	const { mutate: mutateLock, isPending: isLocking } = client.useMutation("post", "/teams/{id}/lock", {
		onSuccess() {
			toast.success("Team Successfully Locked");
			if (team && tournament) {
				router.navigate({
					to: "/tournaments/$tournamentid/$teamid",
					params: {
						tournamentid: tournament.slug,
						teamid: String(team.id),
					},
				});
			}
		},
		onError(error) {
			const errorMessage = errorModelToDescription(error);
			toast.error(`Error while locking team: ${errorMessage}`);
		},
	});

	function handleDelete() {
		if (!team) return;
		mutateDelete({
			params: { path: { id: team.id } },
		});
		setConfirmOpen(false);
	}

	function handleLock() {
		if (!team) return;
		mutateLock({
			params: { path: { id: team.id } },
		});
		setLockDialogOpen(false);
	}

	return (
		<>
			<Card className="p-2 text-white border-0 bg-card max-w-4xl mx-auto w-full">
				<CardContent className='font-bold p-2 flex justify-between'>
					<CardTitle>
						Edit {team.name}
					</CardTitle>
					{team.is_locked === false && (
						<>
							<Button onClick={() => setLockDialogOpen(true)} disabled={isLocking}>
								{isLocking ? 'Locking…' : 'Lock Team'}
							</Button>
							<Dialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Lock team</DialogTitle>
										<DialogDescription>
											Are you sure you want to lock this team? This action cannot be undone.<br />
											<span className="block mt-2 text-sm text-muted-foreground">
												After locking, you will <b>not</b> be able to modify team members anymore, but you can still change the team name and image.
											</span>
										</DialogDescription>
									</DialogHeader>
									<DialogFooter>
										<Button type="button" variant="ghost" onClick={() => setLockDialogOpen(false)}>Cancel</Button>
										<Button type="button" onClick={handleLock} disabled={isLocking}>
											{isLocking ? 'Locking…' : 'Lock'}
										</Button>
									</DialogFooter>
									<DialogClose />
								</DialogContent>
							</Dialog>
						</>
					)}
					<Button
						variant="destructive"
						onClick={() => setConfirmOpen(true)}
						disabled={isDeleting}
					>
						{isDeleting ? 'Deleting…' : 'Delete Team'}
					</Button>
				</CardContent>
			</Card>
			<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete team</DialogTitle>
						<DialogDescription>
							This action cannot be undone. Are you sure you want to continue?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button type="button" variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
						<Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
							{isDeleting ? 'Deleting…' : 'Delete'}
						</Button>
					</DialogFooter>
					<DialogClose />
				</DialogContent>
			</Dialog>
		</>
	);
}