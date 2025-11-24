import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { components } from "@/lib/api/types";
import TournamentAdminAddModal from "./admins/admin-add-modal";
import UserCard from "@/components/users/user-card";
import TournamentAdminCard from "@/components/tournaments/admin/admins/admin-card"
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth.provider";
import { useHasRole } from "@/hooks/use-can";

export default function TournamentAdminList({tournament, refetchTournament} : {tournament: components["schemas"]["Tournament"]; refetchTournament: () => any;}) {
	const [role, setRole] = useState<components["schemas"]["LightTournamentAdmin"]["role"] | undefined>(undefined);
	const {me} = useAuth();
	const hasRole = useHasRole();

	useEffect(() => {
		let tempRole = tournament.admins?.find((admin) => admin.user.id === me.id)?.role;

		if (!tempRole && hasRole(['super_admin'])) {
			tempRole = "SUPER_ADMIN"
		}
		setRole(tempRole)
	}, [tournament.admins, me.id])

	return (
		<Card className="@container/card">
			<CardHeader className="flex flex-row items-center justify-between space-y-0">
				<div>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						Admins
					</CardTitle>
					<p className="text-sm text-muted-foreground">Manage tournament administrators and their roles.</p>
				</div>
				<div className="flex items-center gap-2">
					<TournamentAdminAddModal myRole={role} tournamentid={tournament.id} refetchTournament={refetchTournament} />
				</div>
			</CardHeader>
			<CardContent className='flex flex-col gap-4'>
				<section aria-labelledby="creator-heading">
					<h3 id="creator-heading" className="text-lg font-medium">Creator</h3>
					<div className="mt-2">
						{((tournament.admins ?? []).filter((admin) => admin.role == "CREATOR")).length === 0 ? (
							<div className="col-span-full text-sm text-muted-foreground">No creator found.</div>
						) : (
							(tournament.admins ?? []).filter((admin) => admin.role == "CREATOR").map((admin) => (
								<UserCard user={admin.user} className="max-w-sm w-full" key={admin.user.id}/>
							))
						)}
					</div>
				</section>

				<section aria-labelledby="super-admins-heading">
					<div className="flex items-center justify-between">
						<h3 id="super-admins-heading" className="text-lg font-medium">Super Admins</h3>
						<p className="text-sm text-muted-foreground">Elevated permissions</p>
					</div>
					<div className='mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
						{((tournament.admins ?? []).filter((admin) => admin.role == "SUPER_ADMIN")).length === 0 ? (
							<div className="col-span-full text-sm text-muted-foreground">No super admins defined.</div>
						) : (
							(tournament.admins ?? []).filter((admin) => admin.role == "SUPER_ADMIN").map((admin) => (
								<TournamentAdminCard myRole={role} admin={admin} tournamentid={tournament.id} refetchTournament={refetchTournament} key={admin.user.id}/>
							))
						)}
					</div>
				</section>

				<section aria-labelledby="admins-heading">
					<div className="flex items-center justify-between">
						<h3 id="admins-heading" className="text-lg font-medium">Admins</h3>
						<p className="text-sm text-muted-foreground">Standard admins with limited permissions</p>
					</div>
					<div className='mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
						{((tournament.admins ?? []).filter((admin) => admin.role == "ADMIN")).length === 0 ? (
							<div className="col-span-full text-sm text-muted-foreground">No admins defined.</div>
						) : (
							(tournament.admins ?? []).filter((admin) => admin.role == "ADMIN").map((admin) => (
								<TournamentAdminCard myRole={role} admin={admin} tournamentid={tournament.id} refetchTournament={refetchTournament} key={admin.user.id}/>
							))
						)}
					</div>
				</section>
			</CardContent>
		</Card>
	)
}