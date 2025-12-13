import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { components } from "@/lib/api/types";
import { Card, CardContent } from '../../ui/card';

export default function MyProfileCard({user}: {user: components['schemas']['User']}) {

	return (
		<Card className="max-w-4xl mx-auto w-full">
			<CardContent>
				<div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
					<div className="relative">
						<Avatar className="h-24 w-24">
						<AvatarImage src={user.picture ?? 'https://static.posters.cz/image/750/star-wars-see-no-stormtrooper-i101257.jpg'} alt="Profile" />
						<AvatarFallback className="text-2xl">JD</AvatarFallback>
						</Avatar>
					</div>
					<div className="flex-1 space-y-2">
						<div className="flex flex-col gap-2 md:flex-row md:items-center">
							<h1 className="text-2xl font-bold text-white">{user.username}</h1>
							{user.kind === "admin" && <Badge className="bg-purple-700 text-white" variant="secondary">Admin</Badge>}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
