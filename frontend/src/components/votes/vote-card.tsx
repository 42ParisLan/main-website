import { memo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { components } from '@/lib/api/types';

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
        <div className="p-[4px] rounded-xl bg-gradient-to-r from-primary to-secondary transition-all duration-300 group hover:scale-[1.02] hover:shadow-xl">
			<Card className="text-white border-0 overflow-hidden rounded-xl bg-gradient-to-l from-black to-gray-800">
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
							<a 
								href={`/votes/${vote.id}`}
								className="text-primary hover:underline"
							>
								Go vote
							</a>
						</>
					)}
					{status === 'finished' && (
						<>
							<p className="text-muted-foreground">Vote is finished</p>
							<a 
								href={`/votes/${vote.id}/results`}
								className="text-primary hover:underline"
							>
								See Results
							</a>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export default memo(VoteCard);
