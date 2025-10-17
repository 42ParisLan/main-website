import type { components } from "@/lib/api/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useQueryClient from "@/hooks/use-query-client";
import { useCallback } from "react";
import useCan from "@/hooks/use-can";
import { IconTrash } from "@tabler/icons-react";

export default function AdminCard({user}: {user: components['schemas']['User']}) {
	const client = useQueryClient();
	const can = useCan();
	const {mutate} = client.useMutation("post", "/users/{id}/kind")

	const handleDeleteAdmin = useCallback(() => {
		mutate({
			params:{
				query: {
					kind: "basic"
				},
				path: {
					id: user.id as number
				}
			}
		})
	}, [mutate])

	const canDeleteAdmin = can("/users/*/kind", "POST");

	return (
		<Card className="group relative overflow-hidden">
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
						<h3 className="text-lg font-bold">{user.usual_first_name} {user.last_name}</h3>
						<h2>@{user.username}</h2>
					</div>
				</div>
				{canDeleteAdmin && (
					<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
						<Button
							variant="destructive"
							size="lg"
							onClick={handleDeleteAdmin}
							className="gap-2"
						>
							<IconTrash className="w-5 h-5" />
							Remove Admin
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
