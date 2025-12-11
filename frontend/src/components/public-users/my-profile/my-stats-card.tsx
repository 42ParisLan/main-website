import { Card, CardContent } from '../../ui/card';

export default function MyStatsCard() {
	return (
		<Card className='max-w-[500px]'>
			<CardContent>
				<div className="w-[100px]">
					<div className="relative">
						<p className="text-white">STATS</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
