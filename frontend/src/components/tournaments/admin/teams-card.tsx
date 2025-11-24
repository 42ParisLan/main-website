import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { components } from "@/lib/api/types";

export function TeamCard({team}:{team: components['schemas']['LightTeam']}) {
	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>{team.name}</CardTitle>
				</CardHeader>
				<CardContent>
					{team.image_url ? (
						<img
							src={team.image_url}
							alt={`${team.name} logo`}
							className="w-24 h-24 rounded-md object-cover mb-3"
						/>
					) : null}

					{team.members?.map((member) => (
						<div key={member.user.id} className="flex items-center gap-3 py-2">
							<img
								src={member.user.picture ?? ''}
								alt={member.user.username ?? 'team member'}
								className="w-10 h-10 rounded-full object-cover"
							/>
							<div>
								<p className="text-sm font-medium">{member.user.username ?? 'Unknown'}</p>
								{member.role && <p className="text-xs text-muted-foreground">{member.role}</p>}
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		</>
	)
}