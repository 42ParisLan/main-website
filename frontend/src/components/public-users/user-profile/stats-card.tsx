import type { components } from '@/lib/api/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import useQueryClient from '@/hooks/use-query-client';
import { useState } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	TableFooter,
} from '@/components/ui/table';
import { Link } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import defaultTeamImage from "@/assets/default-team.png"
import { Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MyStatsCard({user}: {user: components['schemas']['User']}) {
	const client = useQueryClient();
	const [page, setPage] = useState(0);

	const {data, isLoading} = client.useQuery("get", "/users/{id}/teams", {
		params: {
			path: {
				id: user.id
			},
			query: {
				page: page,
				limit: 10
			}
		}
	})

	const getRankDisplay = (team: components['schemas']['LightTeam']) => {
		if (!team.rank_group) return 'N/A';
		const { rank_min, rank_max } = team.rank_group;
		if (rank_min === rank_max) return `#${rank_min}`;
		return `#${rank_min}-${rank_max}`;
	};

	const getRankValue = (team: components['schemas']['LightTeam']) => {
		if (!team.rank_group) return 999;
		return Math.floor((team.rank_group.rank_min + team.rank_group.rank_max) / 2);
	};

	const getRankClassName = (team: components['schemas']['LightTeam']) => {
		const rank = getRankValue(team);
		if (rank === 1) return 'bg-[var(--placement-1)]';
		if (rank === 2) return 'bg-[var(--placement-2)]';
		if (rank === 3) return 'bg-[var(--placement-3)]';
		if (rank === 4) return 'bg-[var(--placement-4)]';
		return 'bg-[var(--placement-lightblue)]';
	};

	const canUserReceiveTeamElo = (team: components['schemas']['LightTeam']) => {
		if (!team.members) return false;
		return team.members.some(member => member.user?.id === user.id && member.can_receive_team_elo);
	};

	return (
		<Card className="max-w-4xl mx-auto w-full">
			<CardHeader>
				<CardTitle>Teams</CardTitle>
				<CardDescription>
					All teams {user.username} is a member of
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[50px]">Rank</TableHead>
							<TableHead>Team</TableHead>
							<TableHead>Tournament</TableHead>
							<TableHead className="text-right w-[80px]">Elo</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={4} className="text-center">
									Loading...
								</TableCell>
							</TableRow>
						) : !data?.items || data.items.length === 0 ? (
							<TableRow>
								<TableCell colSpan={4} className="text-center">
									No teams for the moment
								</TableCell>
							</TableRow>
						) : (
							data.items.map((team) => (
								<TableRow key={team.id}>
									<TableCell
										className={`text-center font-bold text-white ${getRankClassName(team)}`}
									>
										{getRankDisplay(team)}
									</TableCell>
									<TableCell>
										<Link to={"/tournaments/$tournamentid/$teamid"} params={{tournamentid: team.tournament?.slug ?? '', teamid: String(team.id)}}>
											<div className="flex items-center gap-3">
												<Avatar className="h-9 w-9">
													<AvatarImage
														src={team.image_url ?? defaultTeamImage}
														alt="Team Avatar"
													/>
													<AvatarFallback>
														{team.name.slice(0, 2)}
													</AvatarFallback>
												</Avatar>
												<div className="flex items-center gap-2">
													{team.name}
													{getRankValue(team) <= 3 && team.rank_group && (
														<Crown
															size={16}
															className={
																getRankValue(team) === 1
																	? 'text-yellow-500'
																	: getRankValue(team) === 2
																		? 'text-gray-400'
																		: 'text-yellow-700'
															}
														/>
													)}
												</div>
											</div>
										</Link>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-3">
											{team.tournament?.image_url && (
												<Avatar className="h-9 w-9">
													<AvatarImage
														src={team.tournament.image_url}
														alt="Tournament Avatar"
													/>
													<AvatarFallback>
														{team.tournament.name.slice(0, 2)}
													</AvatarFallback>
												</Avatar>
											)}
											<span>{team.tournament?.name ?? 'N/A'}</span>
										</div>
									</TableCell>
									<TableCell className="text-right font-semibold text-white/90">
										{canUserReceiveTeamElo(team) ? team.elo ?? 'N/A' : 'N/A'}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
					{data && data.total_pages > 1 && (
						<TableFooter>
							<TableRow>
								<TableCell colSpan={4}>
									<div className="flex items-center justify-between">
										<p className="text-sm text-muted-foreground">
											Page {page + 1} of {data.total_pages}
										</p>
										<div className="flex gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => setPage((p) => Math.max(0, p - 1))}
												disabled={page === 0}
											>
												<ChevronLeft className="h-4 w-4" />
												Previous
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => setPage((p) => Math.min(data.total_pages - 1, p + 1))}
												disabled={page >= data.total_pages - 1}
											>
												Next
												<ChevronRight className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</TableCell>
							</TableRow>
						</TableFooter>
					)}
				</Table>
			</CardContent>
		</Card>
	);
}
