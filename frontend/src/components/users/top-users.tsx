import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import type { components } from '@/lib/api/types';
import { Crown } from 'lucide-react';
import defaultpicture from '@/assets/default.png';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

export default function TopUsers({
	users,
}: {
	users: components['schemas']['LightUser'][];
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Top Players</CardTitle>
				<CardDescription>
					Our top 10 players across all tournaments.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[50px]">Rank</TableHead>
							<TableHead>Player</TableHead>
							<TableHead className="text-right">Elo</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{users?.map((user, index) => (
							<TableRow key={user.id}>
								<TableCell
									className={`text-center font-bold text-white ${
										index === 0
											? 'bg-[#665400]'
											: index === 1
												? 'bg-[#223f44]'
												: index === 2
													? 'bg-[#4b3d1b]'
													: index === 3
														? 'bg-[#663700]'
														: 'bg-[#1f8383]'
									}`}
								>
									{index + 1}
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-3">
										<Avatar className="h-9 w-9">
											<AvatarImage
												src={user.picture ?? defaultpicture}
												alt="Avatar"
											/>
											<AvatarFallback>
												{user.username.slice(0, 2)}
											</AvatarFallback>
										</Avatar>
										<div className="flex items-center gap-2">
											{user.username}
											{index < 3 && (
												<Crown
													size={16}
													className={
														index === 0
															? 'text-yellow-500'
															: index === 1
																? 'text-gray-400'
																: 'text-yellow-700'
													}
												/>
											)}
										</div>
									</div>
								</TableCell>
								<TableCell className="text-right">N/A</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
