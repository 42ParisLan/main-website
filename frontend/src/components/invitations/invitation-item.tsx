import { Button } from '@/components/ui/button';
import useQueryClient from '@/hooks/use-query-client';
import type { components } from '@/lib/api/types';
import { useAuth } from '@/providers/auth.provider';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';

type Invitation = components['schemas']['Invitation'];

export default function InvitationItem({ invitation, tournamentid = undefined }: { invitation: Invitation; tournamentid: undefined | string }) {
	const client = useQueryClient();
	const { me } = useAuth();
	const [removed, setRemoved] = useState(false);

	const { mutate: mutateAccept, isPending: isAccepting } = client.useMutation('post', '/invitations/{id}/accept', {
		onSuccess() {
		toast.success('Invitation accepted');
		setRemoved(true);
		},
		onError(err) {
		console.error('Failed to accept invitation', err);
		toast.error('Failed to accept invitation');
		},
	});

	const { mutate: mutateDelete, isPending: isDeleting } = client.useMutation('delete', '/invitations/{id}', {
		onSuccess() {
		toast.success('Invitation removed');
		setRemoved(true);
		},
		onError(err) {
		console.error('Failed to delete invitation', err);
		toast.error('Failed to delete invitation');
		},
	});

	if (removed) return null;

	const isMine = invitation.user?.id === me.id;

		return (
			<div className="flex items-center justify-between gap-4 p-2">
				<div className="flex items-center gap-3">
					{isMine ? (
						<div>
							<p className="text-sm">Invitation to join team <strong>{invitation.team?.name}</strong></p>
							<p className="text-xs text-muted-foreground">Role: {invitation.role}</p>
							{invitation.message && (
								<p className="text-xs text-muted-foreground">Message: {invitation.message}</p>
							)}
						</div>
					) : (
						<div className="flex items-center gap-3">
							{invitation.user?.picture ? (
								<img src={invitation.user.picture} alt={invitation.user.username ?? 'user'} className="w-10 h-10 rounded-full object-cover" />
							) : (
								<div className="w-10 h-10 rounded-full bg-muted" />
							)}
							<div>
								<p className="text-sm">Invitation for <strong>@{invitation.user?.username}</strong></p>
								<p className="text-xs text-muted-foreground">Role: {invitation.role} — {invitation.message}</p>
							</div>
						</div>
					)}
				</div>
			<div className="flex items-center gap-2">
				{isMine ? (
					<>
						{tournamentid && (
							<Button asChild>
								<Link to={"/tournaments/$tournamentid/$teamid"} params={{teamid: String(invitation.team.id), tournamentid}}>
									Check team
								</Link>
							</Button>
						)}
						<Button disabled={isAccepting} onClick={() => mutateAccept({ params: { path: { id: invitation.id } } })}>Accept</Button>
						<Button disabled={isDeleting} variant="destructive" onClick={() => mutateDelete({ params: { path: { id: invitation.id } } })}>Refuse</Button>
					</>
				) : (
					<Button disabled={isDeleting} variant="destructive" onClick={() => mutateDelete({ params: { path: { id: invitation.id } } })}>Delete</Button>
				)}
			</div>
		</div>
	);
}
