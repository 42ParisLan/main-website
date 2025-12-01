import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PaginatedListControlled } from '@/components/ui/paginated-list';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UserSearch from '@/components/users/user-search';
import InvitationItem from '@/components/invitations/invitation-item';
import useQueryClient from '@/hooks/use-query-client';
import type { components } from '@/lib/api/types';
import { useAuth } from '@/providers/auth.provider';
import { useForm } from '@tanstack/react-form';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/home-page/header'
import { Footer } from '@/components/home-page/footer'

export const Route = createFileRoute(
	'/tournaments/$tournamentid/$teamid/edit/',
)({
	component: RouteComponent,
})

function RouteComponent() {
	const {tournamentid, teamid} = Route.useParams();
	const client = useQueryClient();
	const router = useRouter();
	const {me} = useAuth();

	const {data: team, error: errorTeam} = client.useQuery("get", "/teams/{id}", {
		params: {
			path: {
				id: Number(teamid)
			}
		}
	})

	const {data: tournament, error: errorTournament} = client.useQuery("get", "/tournaments/{id_or_slug}", {
		params: {
			path: {
				id_or_slug: tournamentid
			}
		}
	})

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

	const {mutate : mutateDelete} = client.useMutation("delete", "/teams/{id}", {
		onSuccess() {
			toast.success("Team Successfuly deleted")
			if (tournament) {
				router.navigate({
					to: "/tournaments/$tournamentid",
					params: {
						tournamentid: tournament.slug,
					},
				})
			}
		},
		onError(error) {
			console.error('Error deleting team', error)
			toast.error("Failed to Delete Team")
		}
	})

	const {mutate : mutateLock} = client.useMutation("post", "/teams/{id}/lock", {
		onSuccess() {
			toast.success("Team Successfuly Locked")
			if (team && tournament) {
				router.navigate({
					to: "/tournaments/$tournamentid/$teamid",
					params: {
						tournamentid: tournament.slug,
						teamid: String(team.id)
					},
				})
			}
		},
		onError(error) {
			console.error('Failed to lock team', error)
			toast.error("Failed to Lock Team, check that the team has correct structure")
		}
	})

	const performDelete = useCallback(() => {
		if (!team) return;
		mutateDelete({
			params: {
				path: {
					id: team.id,
				},
			},
		});
	}, [mutateDelete, team]);

	const performLock = useCallback(() => {
		if (!team) return;
		mutateLock({
			params: {
				path: {
					id: team.id,
				},
			},
		});
	}, [mutateLock, team]);

	const [confirmOpen, setConfirmOpen] = useState(false);

	const {mutate : mutateInvitation} = client.useMutation("post", "/teams/{id}/invitations", {
		onSuccess() {
			toast.success("Invitation Successfuly sended")
			setInvitationOpen(false)
		},
		onError(error) {
			console.error('Error sending Invitation', error)
			toast.error("Failed to send Invitation")
		}
	})

	const [selectedUser, setSelectedUser] = useState<undefined | components['schemas']['LightUser']>(undefined);

	const inviteForm = useForm({
		defaultValues: {
			message: '',
			user_id: 0,
			role: "",
		},
		onSubmit: ({value}) => {
			if (!team) return;
			const body: components["schemas"]["CreateInvitation"] = {
				message: value.message,
				role: value.role,
				user_id: value.user_id,
			}
			mutateInvitation({
				params: {
					path: {
						id: team.id,
					},
				},
				body
			});
		}
	})

	const [invitationOpen, setInvitationOpen] = useState(false);

	useEffect(() => {
		if (team?.creator?.id !== me.id) {
			router.navigate({to: "/tournaments/$tournamentid/$teamid", params: {tournamentid, teamid}})
		}
	}, [team?.creator, me.id])

	const roles = useMemo(() => {
		return Object.keys(tournament?.team_structure ?? {});
	}, [tournament?.team_structure])

	if ((isErrorInvitations || errorTeam) && !errorTournament) {
		router.navigate({to: `/tournaments/$tournamentid`, params: {tournamentid}})
		return null
	}

	if (errorTournament) {
		router.navigate({to: `/tournaments`})
		return null
	}

	if (team && tournament) {
		return (
			<>
				<Card>
					<CardHeader className='flex justify-between'>
						<CardTitle>
							Edit {team.name}
						</CardTitle>
						team for tournament: "{tournament.name}"
						<Button
							onClick={performLock}
						>
							Lock Team
						</Button>
						<Button
							variant="destructive"
							onClick={() => setConfirmOpen(true)}
						>
							Delete Team
						</Button>
					</CardHeader>
					<CardContent>
						{Object.entries(tournament.team_structure).map(([key, _]) => {
							const users = team.members?.filter((user) => user.role == key);
							if (users && users.length > 0)
							{
								return (
									<>
										<p>{key}</p>
										{users.map((team_member) => (
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
							}
						})}
						<Button
							onClick={() => setInvitationOpen(true)}
						>
							Invite User
						</Button>
					</CardContent>
				</Card>
				<Card>
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
				{/* Confirmation dialog for deleting visible tournaments */}
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
							<Button type="button" variant="destructive" onClick={() => { performDelete(); setConfirmOpen(false); }}>Delete</Button>
						</DialogFooter>
						<DialogClose />
					</DialogContent>
				</Dialog>
				{/* Invitation dialog for adding users */}
				<Dialog open={invitationOpen} onOpenChange={setInvitationOpen}>
					<DialogContent>
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
							<inviteForm.Field
								name='message'
							>
								{(field) => (
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
						<Button
									variant="destructive"
									onClick={() => setConfirmOpen(true)}
								>
									Delete Team
								</Button>
							</CardContent>
						</Card>
						<div className="flex py-2 gap-2 min-h-screen flex-row justify-center ">
							<Card className=" w-full flex-1 border-0 bg-gradient-to-br from-black to-gray-700">
								<CardContent>
									{Object.entries(tournament.team_structure).map(([key, _]) => {
										const users = team.members?.filter((user) => user.role == key);
										if (users && users.length > 0)
											{
												return (
													<>
													<p>{key}</p>
													{users.map((team_member) => (
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
										}
									})}
									{team.is_locked == false && (
										<Button
											onClick={() => setInvitationOpen(true)}
											>
											Invite User
										</Button>
									)}
								</CardContent>
							</Card>
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
						</div>
						{/* Confirmation dialog for deleting visible tournaments */}
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
									<Button type="button" variant="destructive" onClick={() => { performDelete(); setConfirmOpen(false); }}>Delete</Button>
								</DialogFooter>
								<DialogClose />
							</DialogContent>
						</Dialog>
						{/* Invitation dialog for adding users */}
						<Dialog open={invitationOpen} onOpenChange={setInvitationOpen}>
							<DialogContent>
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
									<inviteForm.Field
										name='message'
									>
										{(field) => (
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

									<inviteForm.Field
										name='user_id'
									>
										{(field) => (
											<>
												<UserSearch
													onUserSelect={(user) => {
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

									<inviteForm.Field
										name='role'
									>
										{(field) => (
											<Select
												value={field.state.value}
												onValueChange={(v) => field.handleChange(v)}
											>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Select Role" />
												</SelectTrigger>
												<SelectContent>
													{roles.map((r) => (
														<SelectItem key={r} value={r}>
															{r}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
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
					</div>
				</div>
				<Footer/>
			</>
		)
	}
}

//inviation sur cote
//nom de la team en grand au milieu "TEAM nom" et le jeu
//dans /tournaments/team mettre le nom du tournois
//sur la page du tournois mettre register ee vote