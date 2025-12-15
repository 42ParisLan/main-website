import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import useQueryClient from '@/hooks/use-query-client';
import { useForm } from '@tanstack/react-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UserSearch from '@/components/users/user-search';
import InvitationItem from '@/components/invitations/invitation-item';
import { PaginatedListControlled } from '@/components/ui/paginated-list';
import errorModelToDescription from '@/lib/utils';
import type { components } from '@/lib/api/types';

export default function TeamMembersInvitationsCard({
  team,
  tournament,
}: {
  team: components['schemas']['LightTeam'];
  tournament: components['schemas']['Tournament'];
}) {
	const client = useQueryClient();
	const [page, setPage] = useState<number>(0);
	const [invitationOpen, setInvitationOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<any>(undefined);

	const {data: invitations, isLoading: isLoadingInvitations} = client.useQuery("get", "/teams/{id}/invitations", {
		params: {
		path: { id: team?.id ?? 0 },
		query: { page },
		},
		enabled: !!team?.id,
	});

	const roles = useMemo(() => {
		if (!tournament?.team_structure) return Object.keys(tournament?.team_structure ?? {});
		const members = team?.members ?? [];
		return Object.entries(tournament.team_structure)
		.filter(([role, limits]: any) => {
			const count = members.filter((user: any) => user.role === role).length;
			return count < limits.max;
		})
		.map(([role]) => role);
	}, [tournament?.team_structure, team?.members]);

	const hasSpace = useMemo(() => {
		if (!tournament?.team_structure) return true;
		const totalCapacity = Object.values(tournament.team_structure).reduce((acc: number, limits: any) => acc + limits.max, 0);
		const currentMembers = team?.members?.length ?? 0;
		return currentMembers < totalCapacity;
	}, [tournament?.team_structure, team?.members]);

	const {mutate : mutateInvitation} = client.useMutation("post", "/teams/{id}/invitations", {
		onSuccess() {
			toast.success("Invitation Successfully sent");
			setInvitationOpen(false);
		},
		onError(error) {
			const errorDescription = errorModelToDescription(error)
			toast.error(`Error while sending invitation: ${errorDescription}`);
		}
	});

	const inviteForm = useForm({
		defaultValues: {
		message: '',
		user_id: 0,
		role: "",
		},
		onSubmit: ({value}) => {
		if (!team) return;
		const body = {
			message: value.message,
			role: value.role,
			user_id: value.user_id,
		};
		mutateInvitation({
			params: { path: { id: team.id } },
			body,
		});
		}
	});

	return (
		<>
		<Card className=" w-full border-0 bg-card max-w-4xl mx-auto">
			<CardContent className="flex flex-row items-center justify-evenly min-h-[100px] min-w-[100px]">
			<div className="flex flex-col">
				{Object.entries(tournament.team_structure).map(([key, value]) => {
				const users = team.members?.filter((user: any) => user.role == key);
				return (
					<>
					<p>{key} - {users?.length} / {value.min}</p>
					{(users?.length ?? 0) > 0 && users?.map((team_member: any) => (
						<div key={team_member.user?.id} className="flex items-center gap-3 py-2">
						<img
							src={team_member.user?.picture ?? ''}
							alt={team_member.user?.username ?? 'team member'}
							className="w-10 h-10 rounded-full object-cover"
						/>
						<p className="text-sm">{team_member.user?.username ?? 'Unknown'}</p>
						</div>
					))}
					</>
				)
				})}
				{team.is_locked == false && (
				<Button
					onClick={() => setInvitationOpen(true)}
					disabled={!hasSpace}
				>
					Invite User
				</Button>
				)}
			</div>
			<Separator orientation="vertical" className="self-stretch mx-2 bg-gray-500 w-px"/>
			<div>
				<h3>Invitations</h3>
				<PaginatedListControlled<any>
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
			</div>
			</CardContent>
		</Card>
		<Dialog open={invitationOpen} onOpenChange={setInvitationOpen}>
			<DialogContent className="dark overflow-hidden bg-card">
			<form
				onSubmit={(e) => {
				e.preventDefault();
				inviteForm.handleSubmit();
				}}
				className="grid gap-6 py-4"
			>
				<DialogHeader>
				<DialogTitle>Invite User</DialogTitle>
				<DialogDescription>
					This action cannot be undone. Are you sure you want to continue?
				</DialogDescription>
				</DialogHeader>
				<inviteForm.Field name='user_id'>
				{(field: any) => (
					<>
					<UserSearch
						onUserSelect={(user: any) => {
						field.handleChange(user.id);
						setSelectedUser(user);
						}}
						selectedUsers={new Set([field.state.value])}
					/>
					{selectedUser && (
						<>
						<div className="mt-4 p-3 bg-muted rounded-md">
							<p className="text-sm font-medium">Selected user:</p>
							<p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
						</div>
						</>
					)}
					</>
				)}
				</inviteForm.Field>
				<inviteForm.Field name='role'>
				{(field: any) => (
					<Select
					value={field.state.value}
					onValueChange={(v) => field.handleChange(v)}
					>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select Role" />
					</SelectTrigger>
					<SelectContent>
						{roles.map((r: string) => (
						<SelectItem key={r} value={r}>
							{r}
						</SelectItem>
						))}
					</SelectContent>
					</Select>
				)}
				</inviteForm.Field>
				<inviteForm.Field name='message'>
				{(field: any) => (
					<div className="grid gap-2">
					<Label htmlFor={field.name}>Message</Label>
					<Input
						id={field.name}
						value={field.state.value}
						onChange={(e) => field.handleChange(e.target.value)}
						onBlur={field.handleBlur}
						placeholder="Message for the invitation"
						required
					/>
					{field.state.meta.errors?.[0] && (
						<p className="text-destructive text-sm">{field.state.meta.errors[0]}</p>
					)}
					</div>
				)}
				</inviteForm.Field>
				<DialogFooter>
				<Button type="button" variant="ghost" onClick={() => setInvitationOpen(false)}>Cancel</Button>
				<Button type="submit">Invite</Button>
				</DialogFooter>
			</form>
			<DialogClose />
			</DialogContent>
		</Dialog>
		</>
	);
}