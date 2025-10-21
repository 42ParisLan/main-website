import useQueryClient from '@/hooks/use-query-client';
import { useSSE } from '@/hooks/use-sse';
import type { components } from '@/lib/api/types';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react';

export const Route = createFileRoute('/votes/$voteid/live/')({
	component: RouteComponent,
})

function RouteComponent() {
	const { voteid } = Route.useParams();
	const [resultData, setResultData] = useState<components["schemas"]["ResultsResponse"] | null>(null);
	const client = useQueryClient();
	const router = useRouter();

	const {data: vote, error: errorVote} = client.useQuery("get", "/votes/{id}", {
		params: {
			path: {
				id: Number(voteid)
			}
		}
	})

	const { error } = useSSE<"/votes/{id}/live">(`/votes/${voteid}/live`, {
		message: (data) => {
			setResultData(data);
		},
	})

	if (error || errorVote) {
		router.navigate({to: "/votes"})
	}

	const total = resultData?.total_votes ?? 0;
	const results = (resultData?.results ?? []).map((r) => ({
		...r,
		percentage: total > 0 ? (r.votes / total) * 100 : 0,
	}));

	if (!results.length) {
		return <p className="text-muted-foreground">No results yet</p>;
	}

	if (results.length === 2) {
		const component1 = vote?.components?.find(c => c.id === results[0].component_id);
		const component2 = vote?.components?.find(c => c.id === results[1].component_id);

		return (
			<div className="flex h-screen w-full">
				<div 
					className="flex items-center justify-center text-white font-bold text-2xl"
					style={{ 
						width: `${results[0].percentage}%`,
						backgroundColor: component1?.color || '#888'
					}}
				>
					<div className="text-center space-y-4">
						{component1?.image_url && (
							<img 
								src={component1.image_url} 
								alt={results[0].name}
								className="w-32 h-32 object-cover rounded-lg mx-auto shadow-lg"
							/>
						)}
						<div>{results[0].name}</div>
						<div className="text-4xl">{results[0].percentage.toFixed(1)}%</div>
						<div className="text-lg">{results[0].votes} votes</div>
					</div>
				</div>
				<div 
					className="flex items-center justify-center text-white font-bold text-2xl"
					style={{ 
						width: `${results[1].percentage}%`,
						backgroundColor: component2?.color || '#888'
					}}
				>
					<div className="text-center space-y-4">
						{component2?.image_url && (
							<img 
								src={component2.image_url} 
								alt={results[1].name}
								className="w-32 h-32 object-cover rounded-lg mx-auto shadow-lg"
							/>
						)}
						<div>{results[1].name}</div>
						<div className="text-4xl">{results[1].percentage.toFixed(1)}%</div>
						<div className="text-lg">{results[1].votes} votes</div>
					</div>
				</div>
			</div>
		)
	}

	if (results.length >= 3) {
		let cumulativePercentage = 0;
		const segments = results.map((r) => {
			const component = vote?.components?.find(c => c.id === r.component_id);
			const startPercentage = cumulativePercentage;
			cumulativePercentage += r.percentage;
			return {
				...r,
				color: component?.color || '#888',
				startPercentage,
			}
		})

		return (
			<div className="flex flex-col items-center justify-center h-screen w-full p-8">
				<svg viewBox="0 0 100 100" className="w-96 h-96">
					{segments.map((seg, idx) => {
						const startAngle = (seg.startPercentage / 100) * 360;
						const endAngle = ((seg.startPercentage + seg.percentage) / 100) * 360;
						const largeArcFlag = seg.percentage > 50 ? 1 : 0;

						const startX = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
						const startY = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
						const endX = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
						const endY = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

						const pathData = [
							'M 50 50',
							`L ${startX} ${startY}`,
							`A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY}`,
							'Z',
						].join(' ')

						return (
							<path
								key={idx}
								d={pathData}
								fill={seg.color}
								stroke='white'
								strokeWidth='0.5'
							/>
						)
					})}
				</svg>
				<div className="mt-8 space-y-2 w-full max-w-md">
					{results.map((r) => {
						const component = vote?.components?.find(c => c.id === r.component_id);
						return (
							<div key={r.component_id} className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									{component?.image_url && (
										<img 
											src={component.image_url} 
											alt={r.name}
											className="w-8 h-8 object-cover rounded"
										/>
									)}
									<div 
										className='w-4 h-4 rounded-sm'
										style={{ backgroundColor: component?.color || '#888' }}
									/>
									<span className="truncate">{r.name}</span>
								</div>
								<span className="tabular-nums">{r.votes} ({r.percentage.toFixed(1)}%)</span>
							</div>
						)
					})}
					<div className="pt-2 text-sm text-muted-foreground">Total votes: {total}</div>
				</div>
			</div>
		)
	}
}
