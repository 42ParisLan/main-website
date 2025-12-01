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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useQueryClient from '@/hooks/use-query-client'
import type { components } from '@/lib/api/types'
import errorModelToDescription from '@/lib/utils'
import {
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import {
	SortableContext,
	arrayMove,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
	IconDeviceFloppy,
	IconGripVertical,
	IconPlus,
	IconRestore,
	IconTrash,
} from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

function SortableRankItem({
	rank,
	onDelete,
	canEdit,
}: {
	rank: components['schemas']['LightRankGroup']
	onDelete: (id: number) => void
	canEdit: boolean
}) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: rank.id, disabled: !canEdit })

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="bg-card text-card-foreground mb-2 flex items-center gap-2 rounded-md border p-4 shadow-sm"
		>
			{canEdit && (
				<button
					type="button"
					{...attributes}
					{...listeners}
					className="cursor-grab touch-none"
				>
					<IconGripVertical className="text-muted-foreground" />
				</button>
			)}
			<div className="flex-1">
				<p className="font-medium">{rank.name}</p>
				<div className="text-muted-foreground flex gap-4 text-sm">
					<p>Position: {rank.position}</p>
					{rank.rank_min == rank.rank_max ? (
						<p>Rank: {rank.rank_min}</p>
					) : (
						<p>
							Range: {rank.rank_min} - {rank.rank_max}
						</p>
					)}
				</div>
			</div>
			{canEdit && (
				<Button
					variant="ghost"
					size="icon"
					onClick={() => onDelete(rank.id)}
					className="text-destructive hover:text-destructive hover:bg-destructive/10"
				>
					<IconTrash />
				</Button>
			)}
		</div>
	)
}

function getOrdinal(n: number) {
	const s = ['th', 'st', 'nd', 'rd']
	const v = n % 100
	return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export function RankingEditor({
	tournamentID,
	initialRanks,
	refetchRankGroups,
	update,
}: {
	tournamentID: number
	initialRanks: components['schemas']['LightRankGroup'][]
	refetchRankGroups: () => any
	update: boolean
}) {
	const client = useQueryClient()
	const [ranks, setRanks] =
		useState<components['schemas']['LightRankGroup'][]>(initialRanks)

	useEffect(() => {
		setRanks(initialRanks)
	}, [initialRanks])

	const [isCreateOpen, setIsCreateOpen] = useState(false)
	const [newRank, setNewRank] = useState({
		rank_min: '',
		rank_max: '',
	})

	const { mutate } = client.useMutation('put', '/tournaments/{id}/rank-groups', {
		onSuccess: () => {
			toast.success('Rank Groups has been updated')
			refetchRankGroups()
		},
		onError: (error) => {
			const errorDescription = errorModelToDescription(error)
			console.error('Failed to update rank groups: ', errorDescription)
			toast.error('Failed to update rank groups')
		},
	})

	const handleSave = useCallback(() => {
		const body: components['schemas']['UpdateRankGroup'][] = ranks.map(
			(rank) => ({
				position: rank.position,
				rank_max: rank.rank_max,
				rank_min: rank.rank_min,
			}),
		)

		mutate({
			params: {
				path: {
					id: tournamentID,
				},
			},
			body,
		})
	}, [ranks, mutate, tournamentID])

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	)

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event

		if (over && active.id !== over.id) {
			setRanks((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id)
				const newIndex = items.findIndex((item) => item.id === over.id)
				const newItems = arrayMove(items, oldIndex, newIndex)
				return newItems.map((item, index) => ({
					...item,
					position: index + 1,
				}))
			})
		}
	}

	function handleDelete(id: number) {
		setRanks((items) => items.filter((item) => item.id !== id))
	}

	function handleCreate() {
		if (!newRank.rank_min || !newRank.rank_max) return

		const maxId = Math.max(...ranks.map((r) => r.id), 0)
		const maxPosition = Math.max(...ranks.map((r) => r.position), 0)

		const min = Number.parseInt(newRank.rank_min)
		const max = Number.parseInt(newRank.rank_max)

		let name = getOrdinal(min)
		if (min !== max) {
			name += ` - ${getOrdinal(max)}`
		}

		const rank: components['schemas']['LightRankGroup'] = {
			id: maxId + 1,
			name,
			position: maxPosition + 1,
			rank_min: min,
			rank_max: max,
		}

		setRanks([...ranks, rank])
		setIsCreateOpen(false)
		setNewRank({ rank_min: '', rank_max: '' })
	}

	return (
		<Card className="@container/card">
			<CardHeader className="flex w-full flex-row items-center justify-between">
				<CardTitle>Ranks</CardTitle>
				{update && (
					<div className="flex gap-2">
						{JSON.stringify(ranks) !== JSON.stringify(initialRanks) && (
							<Button variant="outline" onClick={() => setRanks(initialRanks)}>
								<IconRestore />
								Restore
							</Button>
						)}
						<Button
							onClick={handleSave}
							disabled={JSON.stringify(ranks) == JSON.stringify(initialRanks)}
						>
							<IconDeviceFloppy />
							Save
						</Button>
					</div>
				)}
			</CardHeader>
			<CardContent>
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
				>
					<SortableContext
						items={ranks.map((r) => r.id)}
						strategy={verticalListSortingStrategy}
					>
						{ranks.map((rank) => (
							<SortableRankItem
								key={rank.id}
								rank={rank}
								onDelete={handleDelete}
								canEdit={update}
							/>
						))}
					</SortableContext>
				</DndContext>
				{update && (
					<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
						<DialogTrigger asChild>
							<button
								type="button"
								className="text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground flex w-full items-center gap-2 rounded-md border border-dashed p-4 transition-colors"
							>
								<IconPlus className="text-muted-foreground" />
								<span className="font-medium">Create new rank</span>
							</button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Create Rank</DialogTitle>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div className="grid grid-cols-4 items-center gap-4">
									<Label htmlFor="min" className="text-right">
										Min Rank
									</Label>
									<Input
										id="min"
										type="number"
										value={newRank.rank_min}
										onChange={(e) =>
											setNewRank({ ...newRank, rank_min: e.target.value })
										}
										className="col-span-3"
									/>
								</div>
								<div className="grid grid-cols-4 items-center gap-4">
									<Label htmlFor="max" className="text-right">
										Max Rank
									</Label>
									<Input
										id="max"
										type="number"
										value={newRank.rank_max}
										onChange={(e) =>
											setNewRank({ ...newRank, rank_max: e.target.value })
										}
										className="col-span-3"
									/>
								</div>
							</div>
							<DialogFooter>
								<Button onClick={handleCreate}>Create</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				)}
			</CardContent>
		</Card>
	)
}
