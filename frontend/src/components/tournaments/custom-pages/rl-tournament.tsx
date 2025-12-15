import { useState, useRef, useEffect } from "react";
import useQueryClient from "@/hooks/use-query-client";
import type { components } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import defaultTournamentImage from "@/assets/default-tournament.png"

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
			<RegistrationOpenComponent tournament={tournament}/>
		)
	} else if (tournament.status == "registration_closed") {
		return (
			<p>Registration are closed now waiting to start tournament</p>
		)
	} else if (tournament.status == "ongoing") {
		return (
			<p>Tournament is actually playing come back after to see results</p>
		)
	} else if (tournament.status == "completed")

	return (
		<p>{tournament.status}</p>
	)
}

function OngoingComponent({
	tournament,
	refetch,
}: {
	tournament: components['schemas']['Tournament'];
	refetch: () => any;
}) {
	const [isMuted, setIsMuted] = useState(true);
	const videoRef = useRef<HTMLVideoElement>(null);

	const toggleMute = () => {
		if (videoRef.current) {
			videoRef.current.muted = !isMuted;
			setIsMuted(!isMuted);
		}
	};

	const [timeLeft, setTimeLeft] = useState('');

	useEffect(() => {
		if (tournament.status !== 'upcoming') return;
		const updateCountdown = () => {
			const now = new Date().getTime();
			const start = new Date(tournament.registration_start).getTime();

			if (now >= start) {
				setTimeLeft('00:00:00');
				refetch();
				return;
			}

			const diff = start - now;
			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			const hours = Math.floor(
				(diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
			);
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((diff % (1000 * 60)) / 1000);

			let timeLeftString = '';
			if (days > 0) {
				timeLeftString += `${String(days).padStart(2, '0')}:`;
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
			<div className="relative w-full flex items-center justify-center bg-black">
				<video
					ref={videoRef}
					className="w-full h-full object-cover"
					autoPlay
					muted
				>
					<source src="/src/assets/42RL.mp4" type="video/mp4" />
					Your browser does not support the video tag.
				</video>

				<Button
					onClick={toggleMute}
					className="absolute bottom-8 right-8 z-10 p-6"
					variant="secondary"
					size="lg"
				>
					{isMuted ? <VolumeX className="h-12 w-12" /> : <Volume2 className="h-12 w-12" />}
				</Button>
			</div>

			<div className="flex flex-col justify-center items-center p-2 gap-20">
				<h2 className="text-gray-300 text-center  text-4xl sm:text-5xl font-bold">
					REGISTRATION OPENS IN
				</h2>

				<div className=" rounded-md p-[4px] bg-gradient-to-br from-primary to-secondary">
					<Card className="bg-gradient-to-tr from-black to-gray-800">
						<CardContent className="w-full h-full flex justify-center items-center">
							<p className="font-mono text-6xl sm:text-7xl md:text-9xl bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
								{timeLeft}
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}

function RegistrationOpenComponent({
	tournament,
}: {
	tournament: components['schemas']['Tournament'];
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
								<h4 className="font-semibol mb-1">📅 Date</h4>
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
								<h4 className="font-semibold mb-1">🎮 What to Bring</h4>
								<ul className="list-disc list-inside space-y-1">
									<li>Your own controller</li>
									<li>Headphones/microphone (if you need to communicate with teammates)</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
				{/* Team Structure */}
				<Card>
					<CardContent className="p-6 space-y-3">
						<h3 className="text-2xl font-bold text-primary">Team Structure</h3>
						{tournament.team_structure ? (
							<div className="text-lg">
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