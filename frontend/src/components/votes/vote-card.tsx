import { memo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { components } from '@/lib/api/types';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';


interface VoteCardProps {
	vote: components['schemas']['LightVote'];
}

function VoteCard({ vote }: VoteCardProps) {
	const [timeLeft, setTimeLeft] = useState('');
	const [status, setStatus] = useState<'pending' | 'active' | 'finished'>('pending');

	useEffect(() => {
		const updateCountdown = () => {
			const now = new Date().getTime();
			const start = new Date(vote.start_at).getTime();
			const end = new Date(vote.end_at).getTime();

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
	}, [vote.start_at, vote.end_at]);

	return (
		<div className="p-[4px] rounded-xl dark bg-gradient-to-r from-primary to-secondary transition-all duration-300 group hover:scale-[1.02] hover:shadow-xl">
			<Card className="border-0 overflow-hidden rounded-xl bg-gradient-to-br from-black to-gray-700 ">
				<CardHeader>
					<CardTitle>{vote.title}</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="mb-4">{vote.description}</p>
					{status === 'pending' && (
						<p className="font-mono text-lg">Starts in: {timeLeft}</p>
					)}
					{status === 'active' && (
						<>
							<p className="font-mono text-lg">Ends in: {timeLeft}</p>
							<div className=" p-2 flex flex-row justify-between items-center">
								<Button asChild variant="secondary">
									<Link 
										to="/votes/$voteid"
										params={{voteid: String(vote.id)}}
										>
										Go vote
									</Link>
								</Button>
								<Button asChild variant="secondary">
									<Link 
										to="/votes/$voteid/live"
										params={{voteid: String(vote.id)}}
										>
										See live
									</Link>
								</Button>
								
							</div>
						</>
					)}
					{status === 'finished' && (
						<>
							<p className="text-muted-foreground">Vote is finished</p>
							<Link 
								to="/votes/$voteid/results"
								params={{voteid: String(vote.id)}}
								className="text-primary hover:underline"
								>
								See Results
							</Link>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export default memo(VoteCard);
