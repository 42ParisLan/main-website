import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { components } from '@/lib/api/types';
import { useAuth } from '@/providers/auth.provider';
import { useHasRole } from '@/hooks/use-can';

interface VoteCardProps {
	vote: components['schemas']['LightVote'];
}

export default function VoteAdmin({ vote }: VoteCardProps) {
	const {me} = useAuth();
	const [status, setStatus] = useState<'pending' | 'active' | 'finished'>('pending');
	const hasRole = useHasRole();

	useEffect(() => {
		const updateCountdown = () => {
			const now = new Date().getTime();
			const start = new Date(vote.start_at).getTime();
			const end = new Date(vote.end_at).getTime();

			let newStatus: 'pending' | 'active' | 'finished';

			if (now < start) {
				newStatus = 'pending';
			} else if (now < end) {
				newStatus = 'active';
			} else {
				setStatus('finished');
				return;
			}

			setStatus(newStatus);
		};

		updateCountdown();
		const interval = setInterval(updateCountdown, 1000);

		return () => clearInterval(interval);
	}, [vote.start_at, vote.end_at]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{vote.title}</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="mb-4">{vote.description}</p>
				<p>{vote.start_at}</p>
				<p>{vote.end_at}</p>
				<p>{status}</p>
				<p className="text-muted-foreground">Vote is finished</p>
				<a 
					href={`/votes/${vote.id}/live`}
					className="text-primary hover:underline"
				>
					See Live
				</a>
				{(vote.creator.id == me.id || hasRole(['super_admin'])) && (
					<a 
						href={`/admin/votes/${vote.id}`}
						className="text-primary hover:underline"
					>
						Edit Vote
					</a>
				)}
			</CardContent>
		</Card>
	);
}