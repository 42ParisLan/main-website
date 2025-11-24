import type { components } from "@/lib/api/types";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";

function formatDate(iso?: string) {
	if (!iso) return "—";
	try {
		return new Date(iso).toLocaleString(undefined, {
			dateStyle: "medium",
			timeStyle: "short",
		});
	} catch {
		return iso;
	}
}

export default function PublicTournamentCard({
	tournament,
}: {
	tournament: components["schemas"]["LightTournament"];
}) {
	const creatorUsername = tournament.creator?.username ?? "unknown";

	const initials = creatorUsername
		.split(" ")
		.map((s) => s[0]?.toUpperCase())
		.slice(0, 2)
		.join("");

	return (
		<Card>
			<CardContent>
				<div className="flex gap-4">
					{/* <div className="flex-shrink-0">
						<Avatar> */}
							{/** Use AvatarImage if creator has an avatar url, otherwise fallback to initials */}
							{/* {"avatar_url" in tournament.creator && tournament.creator.avatar_url ? (
								<AvatarImage src={tournament.creator.avatar_url as string} alt={creatorUsername} />
							) : (
								<AvatarFallback>{initials || "U"}</AvatarFallback>
							)}
						</Avatar>
					</div> */}

					<div className="flex-1 min-w-0">
						<div className="flex items-center justify-between gap-4">
							<div className="min-w-0">
								<h3 className="text-md font-medium truncate">{tournament.name}</h3>
								<p className="text-xs text-muted-foreground truncate">
									{tournament.description ?? "No description"}
								</p>
							</div>

							<div className="flex items-center gap-2">
								<Badge variant={tournament.is_visible ? "secondary" : "outline"}>
									{tournament.is_visible ? "Public" : "Private"}
								</Badge>
							</div>
						</div>

						<div className="mt-2 text-xs text-muted-foreground grid grid-cols-1 gap-1">
							<div>
								<strong>Starts:</strong> {formatDate(tournament.tournament_start)}
							</div>
							<div>
								<strong>Registration:</strong>
								<span className="ml-1">
									{formatDate(tournament.registration_start)} — {formatDate(tournament.registration_end)}
								</span>
							</div>
						</div>

						<div className="mt-3 flex items-center gap-3">
							<Button variant="secondary" size="sm" asChild>
								<Link to={`/tournaments/$tournamentid`} params={{tournamentid: tournament.slug}}>View</Link>
							</Button>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
