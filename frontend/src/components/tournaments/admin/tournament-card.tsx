import type { components } from "@/lib/api/types";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Link } from "@tanstack/react-router";
import defaultimage from "@/assets/default.png"

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
	tournament: components["schemas"]["LightTournament"];
}) {
	const creatorUsername = tournament.creator?.username ?? "unknown";

	return (
		<Card>
			<CardContent>
				<div className="flex gap-4">
					<div className="flex-shrink-0">
						<img
							src={tournament.iamge_url ?? defaultimage}
							className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
						/>
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
							<div>
								<strong>Creator:</strong> <span className="ml-1">{creatorUsername}</span>
							</div>
						</div>

						<div className="mt-3 flex items-center gap-3">
							{tournament.external_links ? (
								Object.entries(tournament.external_links).map(([label, url]) => (
									<a key={label} href={url as string} target="_blank" rel="noopener noreferrer" className="underline text-primary">{label}</a>
								))
							) : (
								<span className="text-muted-foreground">—</span>
							)}

							<Button variant="secondary" size="sm" asChild>
								<Link to={`/admin/tournaments/$tournamentid`} params={{tournamentid: tournament.slug}}>View</Link>
							</Button>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
