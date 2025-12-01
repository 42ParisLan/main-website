import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import useQueryClient from '@/hooks/use-query-client'
import type { components } from '@/lib/api/types'
import errorModelToDescription from '@/lib/utils'
import { IconEdit } from '@tabler/icons-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface TeamRankGroupCardProps {
	team: components['schemas']['LightTeam']
	rankgroups: components['schemas']['LightRankGroup'][]
	refetch: (() => void)[]
}

export function TeamRankGroupCard({
	team,
	rankgroups,
	refetch,
}: TeamRankGroupCardProps) {
	const client = useQueryClient()
	const [isOpen, setIsOpen] = useState(false)
	const [selectedRankGroupId, setSelectedRankGroupId] = useState<string>(
		team.rank_group?.id.toString() ?? '',
	)

	const { mutate, isPending } = client.useMutation('patch', '/teams/{id}/rank-group', {
		onSuccess: () => {
			toast.success('Team rank group updated')
			setIsOpen(false)
			refetch.forEach((r) => r())
		},
		onError: (error) => {
			const errorDescription = errorModelToDescription(error)
			toast.error('Failed to update team rank group', {
				description: errorDescription,
			})
		},
	})

	const handleUpdate = () => {
		if (!selectedRankGroupId) return

		mutate({
			params: {
				path: {
					id: team.id,
				},
			},
			body: {
				rank_group_id: Number.parseInt(selectedRankGroupId),
			},
		})
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{team.name}</CardTitle>
				<Dialog open={isOpen} onOpenChange={setIsOpen}>
					<DialogTrigger asChild>
						<Button variant="ghost" size="icon">
							<IconEdit className="h-4 w-4" />
							<span className="sr-only">Edit rank group</span>
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Update Rank Group</DialogTitle>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<Select
								value={selectedRankGroupId}
								onValueChange={setSelectedRankGroupId}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a rank group" />
								</SelectTrigger>
								<SelectContent>
									{rankgroups.map((group) => (
										<SelectItem key={group.id} value={group.id.toString()}>
											{group.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<DialogFooter>
							<Button onClick={handleUpdate} disabled={isPending}>
								Update
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</CardHeader>
			<CardContent>
				<div className="flex items-center gap-4">
					{team.image_url && (
						<img
							src={team.image_url}
							alt={team.name}
							className="h-12 w-12 rounded-full object-cover"
						/>
					)}
					<div className="grid gap-1">
						<p className="text-sm font-medium leading-none">
							{team.rank_group?.name ?? 'No Rank'}
						</p>
						<p className="text-muted-foreground text-xs">
							{team.members?.length ?? 0} members
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
