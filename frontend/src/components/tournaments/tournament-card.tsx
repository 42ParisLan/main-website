import type { components } from "@/lib/api/types";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";

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

export default function TournamentCard({
	tournament,
}: {
	tournament: components["schemas"]["Tournament"];
}) {
	const teamsCount = tournament.teams ? tournament.teams.length : 0;
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
					<div className="flex-shrink-0">
						<Avatar>
							{/** Use AvatarImage if creator has an avatar url, otherwise fallback to initials */}
							{"avatar_url" in tournament.creator && tournament.creator.avatar_url ? (
								<AvatarImage src={tournament.creator.avatar_url as string} alt={creatorUsername} />
							) : (
								<AvatarFallback>{initials || "U"}</AvatarFallback>
							)}
						</Avatar>
					</div>

					<div className="flex-1 min-w-0">
						<div className="flex items-center justify-between gap-4">
							<div className="min-w-0">
								<h3 className="text-sm font-medium truncate">{tournament.name}</h3>
								<p className="text-xs text-muted-foreground truncate">
									{tournament.description ?? "No description"}
								</p>
							</div>

							<div className="flex items-center gap-2">
								<Badge variant={tournament.is_visible ? "secondary" : "outline"}>
									{tournament.is_visible ? "Public" : "Private"}
								</Badge>
								<Badge variant="outline">Teams {teamsCount}/{tournament.max_teams}</Badge>
							</div>
						</div>

						<div className="mt-2 text-xs text-muted-foreground grid grid-cols-1 sm:grid-cols-2 gap-1">
							<div>
								<strong>Starts:</strong> {formatDate(tournament.tournament_start)}
							</div>
							<div>
								<strong>Ends:</strong> {formatDate(tournament.tournament_end)}
							</div>
							<div>
								<strong>Registration:</strong>
								<span className="ml-1">
									{formatDate(tournament.registration_start)} — {formatDate(tournament.registration_end)}
								</span>
							</div>
							<div>
								<strong>Creator:</strong> <span className="ml-1">{creatorUsername}</span>
							</div>
						</div>

						<div className="mt-3 flex items-center gap-3">
							{tournament.external_link ? (
								<a
									href={tournament.external_link}
									target="_blank"
									rel="noreferrer"
									className="text-sm underline text-primary"
								>
									External link
								</a>
							) : null}

							<a
								href={`/admin/tournaments/${tournament.id}`}
								className="text-sm text-muted-foreground hover:text-foreground underline"
							>
								View
							</a>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
