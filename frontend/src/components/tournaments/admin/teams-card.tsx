import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useQueryClient from '@/hooks/use-query-client'
import type { components } from '@/lib/api/types'
import errorModelToDescription from '@/lib/utils'
import { IconLockOpen, IconTrash } from '@tabler/icons-react'
import { toast } from 'sonner'

export function TeamCard({
	team,
	update,
	refetch,
}: {
	team: components['schemas']['LightTeam']
	update: boolean
	refetch?: () => void
}) {
	const client = useQueryClient()

	const { mutate: unlockTeam, isPending: isUnlocking } = client.useMutation(
		'post',
		'/teams/{id}/unlock',
		{
			onSuccess: () => {
				toast.success('Team unlocked')
				refetch?.()
			},
			onError: (error) => {
				const errorDescription = errorModelToDescription(error)
				toast.error('Failed to unlock team', { description: errorDescription })
			},
		},
	)

	const { mutate: deleteTeam, isPending: isDeleting } = client.useMutation(
		'delete',
		'/teams/{id}',
		{
			onSuccess: () => {
				toast.success('Team deleted')
				refetch?.()
			},
			onError: (error) => {
				const errorDescription = errorModelToDescription(error)
				toast.error('Failed to delete team', { description: errorDescription })
			},
		},
	)

	return (
		<>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle>{team.name}</CardTitle>
					{update && (
						<div className="flex gap-2">
							{team.is_locked == true && (
								<Button
									variant="outline"
									size="icon"
									onClick={() =>
										unlockTeam({ params: { path: { id: team.id } } })
									}
									disabled={isUnlocking}
									title="Unlock Team"
								>
									<IconLockOpen className="h-4 w-4" />
								</Button>
							)}
							<Button
								variant="destructive"
								size="icon"
								onClick={() =>
									deleteTeam({ params: { path: { id: team.id } } })
								}
								disabled={isDeleting}
								title="Delete Team"
							>
								<IconTrash className="h-4 w-4" />
							</Button>
						</div>
					)}
				</CardHeader>
				<CardContent>
					{team.image_url ? (
						<img
							src={team.image_url}
							alt={`${team.name} logo`}
							className="w-24 h-24 rounded-md object-cover mb-3"
						/>
					) : null}

					{team.members?.map((member) => (
						<div key={member.user.id} className="flex items-center gap-3 py-2">
							<img
								src={member.user.picture ?? ''}
								alt={member.user.username ?? 'team member'}
								className="w-10 h-10 rounded-full object-cover"
							/>
							<div>
								<p className="text-sm font-medium">{member.user.username ?? 'Unknown'}</p>
								{member.role && <p className="text-xs text-muted-foreground">{member.role}</p>}
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		</>
	)
}