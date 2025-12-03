import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {type components} from "@/lib/api/types"
import { Link } from "@tanstack/react-router"
import RegisterCard from "./register-card"
import {  useEffect, useState } from 'react';

export default function DefaultTournament({tournament}: {tournament: components['schemas']['Tournament']}) {

	const [timeLeft, setTimeLeft] = useState('');
	const [status, setStatus] = useState<'pending' | 'active' | 'finished'>('pending');

	
	useEffect(() => {
			const updateCountdown = () => {
				const now = new Date().getTime();
				const start = new Date(tournament.registration_start).getTime();
				const end = new Date(tournament.registration_end).getTime();
	
				let diff: number;
				let newStatus: 'pending' | 'active' | 'finished';
	
				if (now < start) {
					diff = start - now;
					newStatus = 'pending';
				} else if (now < end) {
					diff = end - now;
					newStatus = 'active';
				} else {
					setTimeLeft('00:00:00');
					setStatus('finished');
					return;
				}
	
				const hours = Math.floor(diff / (1000 * 60 * 60));
				const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
				const seconds = Math.floor((diff % (1000 * 60)) / 1000);
	
				setTimeLeft(
					`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
				);
				setStatus(newStatus);
			};
	
			updateCountdown();
			const interval = setInterval(updateCountdown, 1000);
	
			return () => clearInterval(interval);
		}, [tournament.registration_start, tournament.registration_end]);
	return (
		<div className="flex flex-1 grid grid-cols-1 gap-4 p-6 bg-gradient-to-br from-black to-gray-800">
			{tournament.status === "registration_open" && (
			<div className="flex flex-col gap-6">
				<Card style={{ fontFamily: "Orbitron" }} className="bg-gradient-to-br from-black to-gray-800">
					<CardHeader>
						<CardTitle className=" text-center text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
							{tournament.name}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card className="bg-gradient-to-tr from-black to-gray-800">
					<CardContent>
						<RegisterCard tournament={tournament}/>
					</CardContent>
					<CardFooter>
						<Button asChild variant="secondary">
							<Link to="/tournaments/$tournamentid/register" params={{tournamentid: tournament.slug}}>
								Register
							</Link>
						</Button>
					</CardFooter>
				</Card>
			</div>
				
			)} 
			{tournament.status === "upcoming" && (
				<div style={{ fontFamily: "Orbitron" }} className="flex flex-col justify-center p-2 gap-20">
					<h2  className="text-gray-300 text-center text-5xl font-bold">REGISTRATION OPENS IN</h2>
		
					<div className=" rounded-md p-[4px] bg-gradient-to-br from-primary to-secondary">
						<Card className="bg-gradient-to-tr from-black to-gray-800">
							<CardContent className="w-full h-full flex justify-center items-center">
								{status === 'pending' && (
									<p className="font-mono text-9xl bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">{timeLeft}</p>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			)}
			{tournament.status === "ongoing" && (
				<Card>
					<CardContent>

					</CardContent>
				</Card>
			)}
			{tournament.status === "completed" && (
				<Card>
					<CardContent>
						
					</CardContent>
				</Card>
			)}
				
		</div>
	)
}
