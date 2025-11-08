import useQueryClient from '@/hooks/use-query-client';
import { useSSE } from '@/hooks/use-sse';
import type { components } from '@/lib/api/types';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, useRef, useEffect, useMemo } from 'react';
import versusIcon from '@/assets/versus-vs-icon.svg';

function DiagonalSplit({ left, right }: { left: string; right: string }) {
	const elRef = useRef<HTMLDivElement | null>(null);
	const [angle, setAngle] = useState<number>(135);

	useEffect(() => {
		const el = elRef.current;
		if (!el) return;

		const compute = () => {
			const { width, height } = el.getBoundingClientRect();
			if (width === 0) return;
			const rad = Math.atan2(width, height);
			const deg = 90 + rad * (180 / Math.PI);
			setAngle(deg);
		};

		compute();
		const ro = new ResizeObserver(compute);
		ro.observe(el);

		return () => ro.disconnect();
	}, []);

	return (
		<div ref={elRef} className="w-full h-full" style={{
			background: `linear-gradient(${angle}deg, ${left} 50%, ${right} 50%)`,
		}} />
	);
}

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

	const results = useMemo(() => {
		if (!resultData) return [];

		const normalized = {
			...resultData,
			results: (resultData.results ?? []).map((r) => ({ ...r })),
		} as typeof resultData;

		const resultsArr = normalized.results ?? [];

		if (resultsArr.length > 1 && (!normalized.total_votes || normalized.total_votes === 0)) {
			resultsArr[0].votes = 1;
			resultsArr[1].votes = 1;
			normalized.total_votes = 2;
		}

		const total = normalized.total_votes ?? 0;
		const MIN_PERCENT = 30;

		const rawResults = resultsArr.map((r) => ({
			...r,
			rawPercentage: total > 0 ? (r.votes / total) * 100 : 0,
		}));

		const n = rawResults.length || 1;
		const effectiveMin = Math.min(MIN_PERCENT, 100 / n);

		const small = rawResults.filter((r) => r.rawPercentage < effectiveMin);
		const large = rawResults.filter((r) => r.rawPercentage >= effectiveMin);

		const allocatedForSmall = small.length * effectiveMin;
		const remainingForLarge = Math.max(0, 100 - allocatedForSmall);
		const sumLargeRaw = large.reduce((s, r) => s + r.rawPercentage, 0) || 1;

		let out = rawResults.map((r) => {
			if (r.rawPercentage < effectiveMin) {
				return { ...r, percentage: r.rawPercentage, visualPercentage: effectiveMin };
			}
			const visual = (r.rawPercentage / sumLargeRaw) * remainingForLarge;
			return { ...r, percentage: r.rawPercentage, visualPercentage: visual };
		});

		const sumVisual = out.reduce((s, it) => s + (it.visualPercentage ?? 0), 0);
		const delta = 100 - sumVisual;
		if (Math.abs(delta) > 1e-9 && out.length > 0) {
			let maxIdx = 0;
			for (let i = 1; i < out.length; i++) {
				if ((out[i].visualPercentage ?? 0) > (out[maxIdx].visualPercentage ?? 0)) {
					maxIdx = i;
				}
			}
			out[maxIdx].visualPercentage = Math.max(0, (out[maxIdx].visualPercentage ?? 0) + delta);
		}

		return out;
	}, [resultData]);

	const [countdown, setCountdown] = useState<string | null>(null);

	function formatDuration(ms: number) {
		if (ms <= 0) return '00:00:00';
		const totalSeconds = Math.floor(ms / 1000);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		const pad = (n: number) => n.toString().padStart(2, '0');
		return `${pad(minutes)}:${pad(seconds)}`;
	}

	useEffect(() => {
		let id: number | undefined;
		function update() {
			if (!vote) {
				setCountdown(null);
				return;
			}
			const now = Date.now();
			const startTs = vote.start_at ? Date.parse(vote.start_at) : NaN;
			const endTs = vote.end_at ? Date.parse(vote.end_at) : NaN;

			if (!isNaN(startTs) && now < startTs) {
				setCountdown(`Starts in ${formatDuration(startTs - now)}`);
				return;
			}
			if (!isNaN(endTs) && now < endTs) {
				setCountdown(`Ends in ${formatDuration(endTs - now)}`);
				return;
			}
			if (!isNaN(endTs) && now >= endTs) {
				setCountdown('Finished');
				return;
			}
			setCountdown(null);
		}

		update();
		id = window.setInterval(update, 1000);
		return () => {
			if (id) clearInterval(id);
		};
	}, [vote?.start_at, vote?.end_at, vote]);

	if (!results.length) {
		return (
			<>
				<p className="text-muted-foreground">No components yet</p>
				{countdown && (
					<div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
						<div className="text-white text-lg md:text-2xl font-semibold drop-shadow-lg bg-black/30 px-4 py-2 rounded">
							{countdown}
						</div>
					</div>
				)}
			</>
		);
	}

	if (vote && results.length === 2) {
		const component1 = vote.components?.find(c => c.id === results[0].component_id);
		const component2 = vote.components?.find(c => c.id === results[1].component_id);

		return (
			<div className="flex w-screen h-screen">
				{ vote.title && (
					<div className="fixed top-4 left-0 right-0 flex justify-center z-50">
						<h1 className="text-white text-5xl md:text-7xl font-extrabold drop-shadow-2xl bg-black/40 px-6 py-3 rounded-lg tracking-tight">
							{vote.title ?? 'Vote'}
						</h1>
					</div>
				) }
				{countdown && (
					<div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
						<div className="text-white text-lg md:text-2xl font-semibold drop-shadow-lg bg-black/30 px-4 py-2 rounded">
							{countdown}
						</div>
					</div>
				)}
				<VoteSide
					visualPercentage={results[0].visualPercentage}
					rawPercentage={results[0].rawPercentage}
					color={component1?.color}
					label={component1?.name}
					imageUrl={component1?.image_url}
					side="left"
					nb_vote={results[0].votes}
				/>
				<div className="w-[20vh] relative flex items-center justify-center">
					<DiagonalSplit left={component1?.color ?? "#000000"} right={component2?.color ?? "#000000"}/>
					<img
						src={versusIcon}
						alt="vs"
						className="absolute z-20 w-12 h-12 md:w-20 md:h-20 pointer-events-none select-none"
					/>
				</div>
				<VoteSide
					visualPercentage={results[1].visualPercentage}
					rawPercentage={results[1].rawPercentage}
					color={component2?.color}
					label={component2?.name}
					imageUrl={component2?.image_url}
					side="right"
					nb_vote={results[1].votes}
				/>
			</div>
		)
	}
}

type VoteSideProps = {
	rawPercentage: number;
	visualPercentage?: number;
	color?: string;
	label?: string;
	imageUrl?: string;
	side: 'left' | 'right';
	nb_vote: number;
};

function VoteSide({ rawPercentage, visualPercentage, color, label, imageUrl, side, nb_vote }: VoteSideProps) {
	const displayPercentage = visualPercentage ? visualPercentage : 50;

	const imageScale = Math.min(85, Math.max(40, displayPercentage * 0.8));

	return (
		<div
			className={`relative flex items-center justify-center text-white font-bold text-2xl transition-all duration-500 ${side == "left" ? "flex-col": "flex-col-reverse" }`}
			style={{
				width: `${displayPercentage}%`,
				backgroundColor: color ?? "#000000",
			}}
		>
			{/* Player Image */}
			{imageUrl && (
				<div
				className="flex items-end justify-center w-full transition-all duration-500 ease-out"
				style={{
					height: `${imageScale}%`,
				}}
				>
					<img
						src={imageUrl}
						alt={label}
						className="h-full object-contain drop-shadow-2xl select-none pointer-events-none"
					/>
				</div>
			)}
			<div className="flex flex-col items-center gap-2 drop-shadow-lg">
				<span>{label}</span>
				<span className="text-3xl">{rawPercentage.toFixed(1)}%</span>
				<span>{nb_vote} votes</span>
			</div>
		</div>
	);
}
