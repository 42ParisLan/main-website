import type { components } from "@/lib/api/types";
import { Card, CardContent } from "../ui/card";
import defaultUserImage from "@/assets/default-user.png"

export default function UserCard({user, ...props}: {user: components['schemas']['User']} & React.ComponentProps<"div">) {
	return (
		<Card {...props}>
			<CardContent>
				<div className="size-full flex flex-col gap-5 items-center justify-center">
					<div className="rounded-lg aspect-square size-full overflow-hidden">
						<img 
							src={user.picture ?? defaultUserImage}
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
