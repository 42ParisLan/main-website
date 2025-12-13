import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { components } from "@/lib/api/types";
import { Card, CardContent } from '../../ui/card';
import { Button } from "../../ui/button";
import useQueryClient from '@/hooks/use-query-client';
import { toast } from 'sonner';
import { useRouter } from '@tanstack/react-router'

export default function MyProfileCard({user}: {user: components['schemas']['User']}) {
	const client = useQueryClient();
	const router = useRouter();
	

	const {mutate : anonymizeUser} = client.useMutation("post", "/me/anonymize", {
		onSuccess() {
			toast.success("User Successfuly Anonymize")
			router.navigate({ to: "/users/me"})
		},
		onError(error) {
			console.error('Failed to anonymize user', error)
			toast.error("Failed to Anonymize user")
		}
	})

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
					<div className="flex gap-6">
						<div>
							<Button
								className=""
								variant="destructive"
								type="button"
								onClick={() => anonymizeUser({})}
							>
								Anonymize
							</Button>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
