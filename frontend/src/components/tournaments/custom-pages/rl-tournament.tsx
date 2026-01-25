import { useState, useEffect} from "react";
import useQueryClient from "@/hooks/use-query-client";
import type { components } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { IconBrandDiscord } from "@tabler/icons-react";
import { Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import defaultTournamentImage from "@/assets/default-tournament.png"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import defaultTeamImage from "@/assets/default-team.png"
import defaultUserImage from "@/assets/default-user.png"
import { PaginatedListControlled } from "@/components/ui/paginated-list";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useEnv } from "@/providers/env.provider";

export default function RLTournament({
	tournament,
	refetch,
}: {
	tournament: components['schemas']['Tournament'];
	refetch: () => any;
}) {

	if (tournament.status == "upcoming") {
		return <OngoingComponent tournament={tournament} refetch={refetch}/>
	} else if (tournament.status == "registration_open") {
		return (
			<RegistrationOpenComponent tournament={tournament} refetch={refetch}/>
		)
	} else if (tournament.status == "registration_closed") {
		return (
			<p>Registration are closed now waiting to start tournament</p>
		)
	} else if (tournament.status == "ongoing") {
		return (
			<p>Tournament is actually playing come back after to see results</p>
		)
	} else if (tournament.status == "completed") {
		return <CompleteComponent tournament={tournament}/>
	}

	return (
		<p>{tournament.status}</p>
	)
}

function getOrdinal(n: number) {
	const s = ['th', 'st', 'nd', 'rd']
	const v = n % 100
	return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function CompleteComponent({
	tournament,
}: {
	tournament: components['schemas']['Tournament'];
}) {
	const client = useQueryClient();
	const [page, setPage] = useState(0);

	const { data: teams, isLoading: isTeamsLoading } = client.useQuery("get", "/tournaments/{id}/teams", {
		params: {
			path: { id: Number(tournament.id) },
			query: {
				page,
				has_rank_group: "yes",
				limit: 10,
				order: "rank_asc"
			}
		}
	});

	const {data: winnerTeam} = client.useQuery("get", "/teams/{id}", {
		params: {
			path: {
				id: 1,
			}
		}
	})

	const {data:mvpUser} = client.useQuery("get", "/users/{id_or_login}", {
		params: {
			path: {
				id_or_login: "hdaher",
			}
		}
	})
	const {data:secondMvpUser} = client.useQuery("get", "/users/{id_or_login}", {
		params: {
			path: {
				id_or_login: "damalca",
			}
		}
	})
	const {data:thirdMvpUser} = client.useQuery("get", "/users/{id_or_login}", {
		params: {
			path: {
				id_or_login: "dnahon",
			}
		}
	})

	const env = useEnv()

	if (!winnerTeam || !mvpUser) {
		return (
			<p>Can't find winner team</p>
		)
	}

	return (
		<div className="w-full min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
			{/* Image Section */}
			<div className="relative w-full">
				<img
					className="w-full h-full object-cover"
					src={tournament.image_url ?? defaultTournamentImage}
					alt={tournament.name}
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black"></div>
			</div>

			{/* Content Section */}
			<div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
				<div className="relative">
					{/* Central Winner Card - Neutral BG */}
					<div className="backdrop-blur-sm border border-slate-500/30 rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/30 mx-4 relative z-20 text-center space-y-8 bg-white/10">
						<div className="absolute -top-8 left-1/2 -translate-x-1/2">
							<div className="w-32 h-16 bg-gradient-to-r from-amber-400 to-yellow-500 text-sm md:text-base font-bold uppercase tracking-widest text-slate-900 px-6 py-3 rounded-full shadow-xl border-4 border-amber-300 flex items-center justify-center">
								CHAMPION
							</div>
						</div>
						<h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent drop-shadow-2xl">
							{tournament.name}
						</h1>
						<p className="text-xl text-slate-300 font-medium">Congratulations to our winner team:</p>
						<div className="border border-slate-500/50 rounded-2xl p-8 space-y-6 bg-slate-900/20">
							<p className="text-3xl md:text-4xl font-bold text-amber-400">{winnerTeam.name}</p>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-{winnerTeam.members?.length} gap-4 pt-6 border-t border-slate-500/50">
								{winnerTeam.members?.map((member) => (
									<Link to={"/users/$userid"} params={{userid: String(member.user.id)}}>
										<div key={member.user.username} className="flex items-center space-x-4 p-4 bg-slate-800/30 rounded-xl hover:bg-slate-700/50 transition-all duration-300 group">
												<img 
													src={member.user.picture ?? defaultUserImage}
													className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-amber-400 shadow-xl group-hover:scale-110 transition-transform duration-200"
													alt={member.user.username}
												/>
												<span className="font-semibold text-white text-lg">{member.user.username}</span>
										</div>
									</Link>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-5xl mx-auto px-4 py-12">
				<div className="text-center space-y-3 mb-16">
					<h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent drop-shadow-xl">
						MVP of the Tournament
					</h2>
				</div>
				
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
					{/* 1st MVP - Gold Podium */}
					<div className="relative group">
						<div className="backdrop-blur-sm bg-white/10 border border-slate-500/30 rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/30 hover:shadow-3xl transition-all duration-500 group-hover:-translate-y-2">
							<Link to={"/users/$userid"} params={{userid: String(mvpUser?.id)}}>
								<div className="absolute -top-12 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl shadow-2xl flex items-center justify-center text-3xl">
									🥇
								</div>
								<img 
									src={mvpUser.picture ?? defaultUserImage}
									className="w-32 h-32 mx-auto rounded-full border-8 border-yellow-400 shadow-2xl mb-6 group-hover:scale-110 transition-transform duration-300"
									alt={mvpUser.username}
								/>
								<h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{mvpUser.username}</h3>
								<div className="grid grid-cols-2 gap-4 text-sm md:text-base text-slate-300 mb-6">
									<div className="space-y-1">
										<div className="font-mono font-bold text-2xl text-yellow-400">899</div>
										<div>Score</div>
									</div>
									<div className="space-y-1">
										<div className="font-mono font-bold text-xl text-emerald-400">3.2</div>
										<div>Goals</div>
									</div>
									<div className="space-y-1">
										<div className="font-mono font-bold text-xl text-blue-400">1.2</div>
										<div>Assists</div>
									</div>
									<div className="space-y-1">
										<div className="font-mono font-bold text-xl text-indigo-400">2.6</div>
										<div>Saves</div>
									</div>
								</div>
							</Link>
						</div>
					</div>

					{/* 2nd Place - Silver */}
					<div className="relative group lg:col-span-1">
						<div className="backdrop-blur-sm bg-white/5 border border-slate-500/20 rounded-2xl p-6 md:p-8 shadow-xl shadow-black/20 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-1">
							<Link to={"/users/$userid"} params={{userid: String(secondMvpUser?.id)}}>
								<div className="absolute -top-10 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl shadow-xl flex items-center justify-center text-2xl">
									🥈
								</div>
								<img 
									src={secondMvpUser?.picture ?? defaultUserImage}
									className="w-24 h-24 mx-auto rounded-full border-4 border-gray-400 shadow-xl mb-4 group-hover:scale-105 transition-transform"
									alt={secondMvpUser?.username}
								/>
								<h4 className="text-xl md:text-2xl font-bold text-slate-200 mb-4">{secondMvpUser?.username ?? 'N/A'}</h4>
								<div className="text-sm text-slate-400 space-y-2">
									<div><span className="font-mono font-semibold text-lg">738</span> score</div>
									<div>2.4 goals | 1.8 assists | 2.2 saves</div>
								</div>
							</Link>
						</div>
					</div>

					{/* 3rd Place - Bronze */}
					<div className="relative group lg:col-span-1">
						<div className="backdrop-blur-sm bg-white/5 border border-slate-500/20 rounded-2xl p-6 md:p-8 shadow-xl shadow-black/20 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-1">
							<Link to={"/users/$userid"} params={{userid: String(thirdMvpUser?.id)}}>
								<div className="absolute -top-10 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl shadow-xl flex items-center justify-center text-2xl">
									🥉
								</div>
								<img 
									src={thirdMvpUser?.picture ?? defaultUserImage}
									className="w-24 h-24 mx-auto rounded-full border-4 border-orange-500 shadow-xl mb-4 group-hover:scale-105 transition-transform"
									alt={thirdMvpUser?.username}
								/>
								<h4 className="text-xl md:text-2xl font-bold text-slate-200 mb-4">{thirdMvpUser?.username ?? 'N/A'}</h4>
								<div className="text-sm text-slate-400 space-y-2">
									<div><span className="font-mono font-semibold text-lg">653</span> score</div>
									<div>2.8 goals | 1 assist | 1 save</div>
								</div>
							</Link>
						</div>
					</div>
				</div>
			</div>


			<Card className='max-w-[500px] w-full mx-auto'>
				<CardHeader>
					<CardTitle>Classement of Tournament</CardTitle>
				</CardHeader>
				<CardContent>
					<Table className="table-fixed w-full">
						<TableHeader>
							<TableRow>
								<TableHead className="w-[80px] text-center">Rank</TableHead>
								<TableHead className="w-[calc(100%-160px)]">Team</TableHead>
								<TableHead className="w-[80px] text-right">Elo</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<PaginatedListControlled<components['schemas']['LightTeam']>
								data={teams}
								page={page}
								onPageChange={(newPage) => setPage(newPage)}
								isLoading={isTeamsLoading}
								removeDiv={true}
								split="items"
								renderItem={(team) => {
									let name = getOrdinal(team.rank_group?.rank_min ?? 0)
									if (team.rank_group?.rank_min !== team.rank_group?.rank_max) {
										name += ` - ${getOrdinal(team.rank_group?.rank_max ?? 0)}`
									}

									return (
										<TableRow key={team.id}>
											<TableCell
												className={`text-center font-bold text-white ${
													team.rank_group?.rank_min === 1
														? 'bg-[var(--placement-1)]'
														: team.rank_group?.rank_min === 2
															? 'bg-[var(--placement-2)]'
															: team.rank_group?.rank_min === 3
																? 'bg-[var(--placement-3)]'
																: team.rank_group?.rank_min === 4
																	? 'bg-[var(--placement-4)]'
																	: 'bg-[var(--placement-lightblue)]'
												}`}
											>
												{name}
											</TableCell>
											<TableCell>
												<Link to={"/tournaments/$tournamentid/$teamid"} params={{teamid: String(team.id), tournamentid: tournament.slug}}>
													<div className="flex items-center gap-3">
														<Avatar className="h-9 w-9">
															<AvatarImage
																src={team.image_url ?? defaultTeamImage}
																alt="Avatar"
															/>
															<AvatarFallback>
																{team.name.slice(0, 2)}
															</AvatarFallback>
														</Avatar>
														<div className="flex items-center gap-2">
															{team.name}
															{team.rank_group?.rank_min !== undefined && team.rank_group.rank_min < 3 && (
																<Crown
																	size={16}
																	className={
																		team.rank_group?.rank_min === 1
																			? 'text-yellow-500'
																			: team.rank_group?.rank_min === 2
																				? 'text-gray-400'
																				: 'text-yellow-700'
																	}
																/>
															)}
														</div>
													</div>
												</Link>
											</TableCell>
											<TableCell className="text-right font-semibold text-white/90">{team.elo == 0 ? 'N/A' : team.elo}</TableCell>
										</TableRow>
									)
								}}
								getItemKey={(team) => team.id}
							/>
						</TableBody>
					</Table>
					<PaginatedListControlled<components['schemas']['LightTeam']>
						data={teams}
						page={page}
						onPageChange={(newPage) => setPage(newPage)}
						isLoading={isTeamsLoading}
						split="pagination"
						renderItem={() => <></>}
						getItemKey={(team) => team.id}
					/>
				</CardContent>
			</Card>

			<div className="w-full flex items-center justify-center py-12">
				<div className="text-center space-y-6 w-full max-w-md mx-auto">
					<h1 className="text-3xl md:text-4xl font-bold text-white">
						Album of the Tournament
					</h1>
					<Carousel className="w-full mx-auto" opts={{ align: 'center', loop: false }}>
						<CarouselContent className="-ml-1">
							{/* Repeat for each image */}
							<CarouselItem className="basis-full">
								<div className="p-1 h-[50vh] flex items-center justify-center rounded-lg overflow-hidden">
									<img 
										src={`${env.MINIO_ENDPOINT}/42lan---rl/image.jpg`}
										className="h-full w-auto mx-auto block object-contain shadow-lg rounded-lg"
										alt="Team"
									/>
								</div>
							</CarouselItem>
							<CarouselItem className="basis-full">
								<div className="p-1 h-[50vh] flex items-center justify-center rounded-lg overflow-hidden">
									<img 
										src={`${env.MINIO_ENDPOINT}/42lan---rl/image2.jpg`}
										className="h-full w-auto mx-auto block object-contain shadow-lg rounded-lg"
										alt="Team"
									/>
								</div>
							</CarouselItem>
							<CarouselItem className="basis-full">
								<div className="p-1 h-[50vh] flex items-center justify-center rounded-lg overflow-hidden">
									<img 
										src={`${env.MINIO_ENDPOINT}/42lan---rl/image3.jpg`}
										className="h-full w-auto mx-auto block object-contain shadow-lg rounded-lg"
										alt="Team"
									/>
								</div>
							</CarouselItem>
							<CarouselItem className="basis-full">
								<div className="p-1 h-[50vh] flex items-center justify-center rounded-lg overflow-hidden">
									<img 
										src={`${env.MINIO_ENDPOINT}/42lan---rl/image4.jpg`}
										className="h-full w-auto mx-auto block object-contain shadow-lg rounded-lg"
										alt="Team"
									/>
								</div>
							</CarouselItem>
							<CarouselItem className="basis-full">
								<div className="p-1 h-[50vh] flex items-center justify-center rounded-lg overflow-hidden">
									<img 
										src={`${env.MINIO_ENDPOINT}/42lan---rl/image5.jpg`}
										className="h-full w-auto mx-auto block object-contain shadow-lg rounded-lg"
										alt="Team"
									/>
								</div>
							</CarouselItem>
							<CarouselItem className="basis-full">
								<div className="p-1 h-[50vh] flex items-center justify-center rounded-lg overflow-hidden">
									<img 
										src={`${env.MINIO_ENDPOINT}/42lan---rl/image6.jpg`}
										className="h-full w-auto mx-auto block object-contain shadow-lg rounded-lg"
										alt="Team"
									/>
								</div>
							</CarouselItem>
							<CarouselItem className="basis-full">
								<div className="p-1 h-[50vh] flex items-center justify-center rounded-lg overflow-hidden">
									<img 
										src={`${env.MINIO_ENDPOINT}/42lan---rl/image7.jpg`}
										className="h-full w-auto mx-auto block object-contain shadow-lg rounded-lg"
										alt="Team"
									/>
								</div>
							</CarouselItem>
							{/* Same for image2.jpg */}
						</CarouselContent>
						<CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2" />
						<CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2" />
					</Carousel>
				</div>
			</div>
		</div>
	)
}

function OngoingComponent({
	tournament,
	refetch,
}: {
	tournament: components['schemas']['Tournament'];
	refetch: () => any;
}) {
	const [timeLeft, setTimeLeft] = useState('');

	useEffect(() => {
		if (tournament.status !== 'upcoming') return;
		const updateCountdown = () => {
			const now = new Date().getTime();
			const end = new Date(tournament.registration_start).getTime();

			if (now >= end) {
				setTimeLeft('Registration Started');
				refetch();
				return;
			}

			const diff = end - now;
			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			const hours = Math.floor(
				(diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
			);
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((diff % (1000 * 60)) / 1000);

			let timeLeftString = '';
			if (days > 0) {
				timeLeftString += `${days}d `;
			}
			timeLeftString += `${String(hours).padStart(2, '0')}:${String(
				minutes
			).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

			setTimeLeft(timeLeftString);
		};

		updateCountdown();
		const interval = setInterval(updateCountdown, 1000);

		return () => clearInterval(interval);
	}, [tournament.registration_start, refetch, tournament.status]);

	return (
		<div className="w-full">
			<div className="text-center space-y-4">
				<h2 className="text-3xl font-bold text-primary">
					REGISTRATIONS OPEN IN
				</h2>
				<div className="rounded-lg p-[3px] bg-gradient-to-r from-primary to-secondary inline-block">
					<div className="bg-gray-900 rounded-lg px-8 py-4">
						<p className="font-mono text-4xl md:text-5xl text-white">
							{timeLeft}
						</p>
					</div>
				</div>
			</div>

			{/* Add space between countdown and title */}
			<div className="h-8" />

			<div className="text-center space-y-3">
				<h1 className="text-5xl md:text-6xl font-bold text-white">{tournament.name}</h1>
				{tournament.description && (
					<p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
						{tournament.description}
					</p>
				)}
			</div>

			{/* Tournament Details */}
			<div className="flex flex-col items-center justify-center mt-8 gap-6">
				<Card>
					<CardContent className="p-6 space-y-4">
						<h3 className="text-2xl font-bold text-primary">Tournament Information</h3>
						<div className="space-y-3">
							<div>
								<h4 className="font-semibold mb-1">📅 Date</h4>
								<p>January 22 & 23, 2025</p>
							</div>
							<div>
								<h4 className="font-semibold mb-1">📍 Location</h4>
								<p>
									<strong>Qualifiers (Jan 22):</strong> Cluster F1B<br />
									<strong>Semi-finals & Finals (Jan 23):</strong> Amphithéâtre Xavier Niel
								</p>
							</div>
							<div>
								<h4 className="font-semibold mb-1">👥 Teams</h4>
								<p>There will be <span className="font-bold text-primary">48 teams</span> competing in this tournament.</p>
							</div>
							<div>
								<h4 className="font-semibold mb-1">🎮 What to Bring</h4>
								<ul className="list-disc list-inside space-y-1">
									<li>Your own controller</li>
									<li>Headphones/microphone (if you need to communicate with teammates)</li>
								</ul>
							</div>
						</div>

						{/* Discord Button inside Card */}
						<div className="pt-4 flex justify-center">
							<Button
								asChild
								variant="ghost"
								size="lg"
								className="flex items-center gap-2 px-8 py-4 text-lg font-semibold bg-[#5865F2] hover:bg-[#4752c4] text-white shadow-md transition-colors"
							>
								<a href="http://discord.42lan.fr" target="_blank" rel="noopener noreferrer">
									<IconBrandDiscord size={28} className="inline-block -mt-1" />
									Join our Discord
								</a>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Add space after tournament information */}
			<div className="h-12" />
		</div>
	)
}

function RegistrationOpenComponent({
	tournament,
	refetch,
}: {
	tournament: components['schemas']['Tournament'];
	refetch: () => any;
}) {
	const [timeLeft, setTimeLeft] = useState('');
	const client = useQueryClient();
	const [page] = useState(1);

	const { data: teams, isLoading: isTeamsLoading } = client.useQuery("get", "/tournaments/{id}/teams", {
		params: {
			path: { id: Number(tournament.id) },
			query: {
				page,
				"status": "register"
			}
		}
	});

	const teamsCount = teams?.total ?? 0;
	const maxTeams = tournament.max_teams ?? 0;

	useEffect(() => {
		const updateCountdown = () => {
			const now = new Date().getTime();
			const end = new Date(tournament.registration_end).getTime();

			if (now >= end) {
				setTimeLeft('Registration Closed');
				refetch();
				return;
			}

			const diff = end - now;
			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			const hours = Math.floor(
				(diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
			);
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((diff % (1000 * 60)) / 1000);

			let timeLeftString = '';
			if (days > 0) {
				timeLeftString += `${days}d `;
			}
			timeLeftString += `${String(hours).padStart(2, '0')}:${String(
				minutes
			).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

			setTimeLeft(timeLeftString);
		};

		updateCountdown();
		const interval = setInterval(updateCountdown, 1000);

		return () => clearInterval(interval);
	}, [tournament.registration_end]);

	return (
		<div className="w-full min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
			{/* Image Section */}
			<div className="relative w-full">
				<img
					className="w-full h-full object-cover"
					src={tournament.image_url ?? defaultTournamentImage}
					alt={tournament.name}
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black"></div>
			</div>

			{/* Content Section */}
			<div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
				<div className="text-center space-y-3">
					<h1 className="text-5xl md:text-6xl font-bold text-white">{tournament.name}</h1>
					{tournament.description && (
						<p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
							{tournament.description}
						</p>
					)}
				</div>
				{/* Tournament Details */}
				<Card>
					<CardContent className="p-6 space-y-4">
						<h3 className="text-2xl font-bold text-primary">Tournament Information</h3>
						<div className="space-y-3">
							<div>
								<h4 className="font-semibold mb-1">📅 Date</h4>
								<p>January 22 & 23, 2025</p>
							</div>
							<div>
								<h4 className="font-semibold mb-1">📍 Location</h4>
								<p>
									<strong>Qualifiers (Jan 22):</strong> Cluster F1B<br />
									<strong>Semi-finals & Finals (Jan 23):</strong> Amphithéâtre Xavier Niel
								</p>
							</div>
							<div>
								<h4 className="font-semibold mb-1">👥 Teams</h4>
								<p>There will be <span className="font-bold text-primary">48 teams</span> competing in this tournament.</p>
							</div>
							<div>
								<h4 className="font-semibold mb-1">🎮 What to Bring</h4>
								<ul className="list-disc list-inside space-y-1">
									<li>Your own controller</li>
									<li>Headphones/microphone (if you need to communicate with teammates)</li>
								</ul>
							</div>
						</div>

						{/* Discord Button inside Card */}
						<div className="pt-4 flex justify-center">
							<Button
								asChild
								variant="ghost"
								size="lg"
								className="flex items-center gap-2 px-8 py-4 text-lg font-semibold bg-[#5865F2] hover:bg-[#4752c4] text-white shadow-md transition-colors"
							>
								<a href="http://discord.42lan.fr" target="_blank" rel="noopener noreferrer">
									<IconBrandDiscord size={28} className="inline-block -mt-1" />
									Join our Discord
								</a>
							</Button>
						</div>
					</CardContent>
				</Card>
				{/* Team Structure */}
				<Card>
					<CardContent className="p-6 space-y-3">
						<h3 className="text-2xl font-bold text-primary">Team Structure</h3>
						{tournament.team_structure ? (
							<div className="text-lg">
								<p className="mb-2">To compose your teams you need to have:</p>
								{Object.entries(tournament.team_structure).map(([role, limits]) => (
									<div key={role} className="mb-2">
										<span className="font-semibold">{role}:</span> {limits.min === limits.max ? limits.min : `${limits.min}-${limits.max}`}
									</div>
								))}
							</div>
						) : (
							<p className="text-lg">Teams information will be announced soon</p>
						)}
					</CardContent>
				</Card>
				{/* Registration Countdown and Teams Count */}
				<div className="text-center space-y-4">
					<h2 className="text-3xl font-bold text-red-500">
						REGISTRATIONS CLOSE IN
					</h2>
					<div className="rounded-lg p-[3px] bg-gradient-to-r from-red-500 to-orange-500 inline-block">
						<div className="bg-gray-900 rounded-lg px-8 py-4">
							<p className="font-mono text-4xl md:text-5xl text-white">
								{timeLeft}
							</p>
						</div>
					</div>
					<div className="mt-4 flex flex-col items-center gap-2">
						<span className="text-lg font-semibold">
							{isTeamsLoading ? 'Loading teams...' : `${teamsCount} / ${maxTeams} teams registered`}
						</span>
						<Button asChild variant="secondary" size="sm" className="mt-2">
							<Link to={`/tournaments/$tournamentid/teams`} params={{ tournamentid: tournament.slug }}>
								See all teams
							</Link>
						</Button>
					</div>
				</div>
				{/* Register Button */}
				<div className="flex flex-col items-center pt-6 gap-2">
					<Button
						asChild
						size="lg"
						className="text-xl px-12 py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
					>
						<Link to={`/tournaments/$tournamentid/register`} params={{tournamentid: tournament.slug}}>
							REGISTER NOW
						</Link>
					</Button>
					{teamsCount >= maxTeams && (
						<span className="text-yellow-400 font-semibold text-lg">Next teams will be on the waitlist</span>
					)}
				</div>
			</div>
		</div>
	)
}