import { Button } from '@/components/ui/button';
import useQueryClient from '@/hooks/use-query-client';
import type { components } from '@/lib/api/types';
import { useAuth } from '@/providers/auth.provider';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';

type Invitation = components['schemas']['Invitation'];

type Props = {
	invitation: Invitation
	tournamentid?: string | undefined
	compact?: boolean
}

export default function InvitationItem({ invitation, tournamentid = undefined, compact = false }: Props) {
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
			<div
				className={
					compact
						? "flex flex-col gap-2 p-3 rounded-lg hover:bg-accent/40 transition-colors"
						: "flex items-center justify-between gap-4 p-3"
				}
			>
				<div className="flex items-start gap-3">
					{!isMine && (
						invitation.user?.picture ? (
							<img
								src={invitation.user.picture}
								alt={invitation.user.username ?? 'user'}
								className={`${compact ? "w-8 h-8" : "w-10 h-10"} rounded-full object-cover`}
							/>
						) : (
							<div className={`${compact ? "w-8 h-8" : "w-10 h-10"} rounded-full bg-muted`} />
						)
					)}
					<div className="space-y-1">
						{isMine ? (
							<>
								<p className={`${compact ? "text-sm" : "text-base"}`}>
									Invitation to join team <strong>{invitation.team?.name}</strong>
								</p>
								<p className="text-xs text-muted-foreground">Role: {invitation.role}</p>
								{invitation.message && (
									<p className="text-xs text-muted-foreground">Message: {invitation.message}</p>
								)}
							</>
						) : (
							<>
								<p className={`${compact ? "text-sm" : "text-base"}`}>
									Invitation for <strong>@{invitation.user?.username}</strong>
								</p>
								<p className="text-xs text-muted-foreground">
									Role: {invitation.role}
									{invitation.message ? ` — ${invitation.message}` : ""}
								</p>
							</>
						)}
					</div>
				</div>
				<div className={`flex items-center gap-2 ${compact ? "justify-end" : ""}`}>
					{isMine ? (
						<>
							{tournamentid && (
								<Button asChild size={compact ? "sm" : undefined} variant={compact ? "outline" : undefined}>
									<Link to={"/tournaments/$tournamentid/$teamid"} params={{teamid: String(invitation.team.id), tournamentid}}>
										Check team
									</Link>
								</Button>
							)}
							<Button
								disabled={isAccepting}
								size={compact ? "sm" : undefined}
								variant={compact ? "secondary" : undefined}
								onClick={() => mutateAccept({ params: { path: { id: invitation.id } } })}
							>
								Accept
							</Button>
							<Button
								disabled={isDeleting}
								variant="destructive"
								size={compact ? "sm" : undefined}
								onClick={() => mutateDelete({ params: { path: { id: invitation.id } } })}
							>
								Refuse
							</Button>
						</>
					) : (
						<Button
							disabled={isDeleting}
							variant="destructive"
							size={compact ? "sm" : undefined}
							onClick={() => mutateDelete({ params: { path: { id: invitation.id } } })}
						>
							Delete
						</Button>
					)}
				</div>
			</div>
		);
}
