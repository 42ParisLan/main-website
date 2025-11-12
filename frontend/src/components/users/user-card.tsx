import type { components } from "@/lib/api/types";
import { Card, CardContent } from "../ui/card";

export default function UserCard({user}: {user: components['schemas']['User']}) {
	return (
		<Card>
			<CardContent>
				<div className="size-full flex flex-col gap-5 items-center justify-center">
					<div className="rounded-lg aspect-square size-full overflow-hidden">
						<img 
							src={user.picture ?? 'https://static.posters.cz/image/750/star-wars-see-no-stormtrooper-i101257.jpg'}
							className="object-cover size-full"
							alt={user.username}
						/>
					</div>
					<div className="flex flex-col items-center">
						<h2>@{user.username}</h2>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
