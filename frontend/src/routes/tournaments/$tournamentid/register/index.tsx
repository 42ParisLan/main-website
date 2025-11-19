import { Button } from '@/components/ui/button';
import useQueryClient from '@/hooks/use-query-client'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useCallback, useEffect } from 'react';

export const Route = createFileRoute('/tournaments/$tournamentid/register/')({
  component: RouteComponent,
})

function RouteComponent() {
	const {tournamentid} = Route.useParams();
	const client = useQueryClient();
	const router = useRouter();

	const { data: tournament, isLoading: isLoadingTournament, isError: isErrorTournament } = client.useQuery("get", "/tournaments/{id_or_slug}", {
		params: {
			path: {
				id_or_slug: tournamentid,
			},
		},
	})

	const { data: team, isLoading: isLoadingTeam } = client.useQuery("get", "/tournaments/{id}/me/team", {
		params: {
			path: {
				id: tournament?.id ?? 0,
			},
		},
		enabled: !!tournament?.id,
	})

	const { mutate: mutateCreateTeam, isPending: isCreating } = client.useMutation("post", "/tournaments/{id}/teams", {
		onSuccess(data) {
			if (data && tournament) {
				router.navigate({
					to: "/tournaments/$tournamentid/$teamid",
					params: {
						tournamentid: String(tournament.id),
						teamid: String(data.id),
					},
				})
			}
		},
		onError(error) {
			console.error('Error creating team', error)
		}
	})

	const handleCreateTeam = useCallback(() => {
		if (!tournament) return
		mutateCreateTeam({
			params: {
				path: { id: tournament.id }
			},
			body: {
				creator_status: "player",
				image: undefined,
				name: "test",
			}
		})
	}, [mutateCreateTeam, tournament])

	useEffect(() => {
		if (isErrorTournament) {
			router.navigate({ to: "/tournaments" })
		}
	}, [isErrorTournament, router])

	useEffect(() => {
		if (team && tournament) {
			router.navigate({
				to: "/tournaments/$tournamentid/$teamid",
				params: {
					tournamentid: String(tournament.id),
					teamid: String((team as any).id),
				},
			})
		}
	}, [team, tournament, router])

	if (isLoadingTournament) {
		return <div className="text-sm text-muted-foreground">Loading tournament…</div>
	}

	if (isErrorTournament) {
		return null
	}

	return (
		<>
			<h1>Create Team</h1>
			<p>Choose your status in team</p>
			{Object.entries(tournament!.team_structure).map(([key, val]) => (
				<p key={key}>{key} {val.min == val.max ? String(val.min) : `${val.min} - ${val.max}`}{val.min == 0 && " (Optional)"}</p>
			))}
			{isLoadingTeam && <div className="text-sm text-muted-foreground">Checking existing team…</div>}
			<p>name of the team</p>
			<input placeholder='name'/>
			<p>Icon of the team (Optionnal)</p>
			<input placeholder='name' type='file' accept='image/*'/>
			<Button type='button' onClick={handleCreateTeam} disabled={isCreating}>
				{isCreating ? 'Creating…' : 'Create'}
			</Button>
		</>
	)
}
