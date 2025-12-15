import type { components } from "@/lib/api/types";
import { Card } from "../../ui/card";
import { Link } from '@tanstack/react-router';
import defaultTeamImage from "@/assets/default-team.png";
import defaultUserImage from "@/assets/default-user.png";
import { Separator } from "@/components/ui/separator";

export function TeamCard({ team }: { team: components['schemas']['LightTeam'] }) {
	// Group members by role
	const membersByRole: Record<string, typeof team.members> = {};
	if (Array.isArray(team.members)) {
		for (const member of team.members) {
			if (!member?.role) continue;
			if (!membersByRole[member.role]) membersByRole[member.role] = [];
			if (member && membersByRole[member.role]) membersByRole[member.role]!.push(member);
		}
	}

	const statusSteps = ["draft", "locked", "waitlist", "registered"];
	let currentIdx = 0;
	if (team.is_registered) {
		currentIdx = 3;
	} else if (team.is_waitlisted) {
		currentIdx = 2;
	} else if (team.is_locked) {
		currentIdx = 1;
	} else {
		currentIdx = 0;
	}

	return (
		<Card className="w-full max-w-2xl mx-auto p-4 flex flex-col gap-4">
			{/* Title row: Team name as title, status stepper on right */}
			<div className="flex flex-row items-center w-full mb-2">
				<h2 className="text-xl font-bold flex-1 truncate">{team.name}</h2>
				<div className="flex flex-row items-center gap-2 flex-shrink-0">
					{statusSteps.map((step, idx) => (
						<div key={step} className="flex flex-col items-center">
							<div
								className={
									`w-3 h-3 rounded-full border ` +
									(idx <= currentIdx ? 'bg-green-500 border-green-600' : 'bg-gray-300 border-gray-400')
								}
								title={step}
							></div>
							{idx < statusSteps.length - 1 && (
								<span className="w-4 h-0.5 bg-gray-300 mx-1"></span>
							)}
						</div>
					))}
				</div>
			</div>

			<div className="flex flex-col sm:flex-row w-full gap-0 items-stretch min-h-[180px]">
				{/* Team photo on top (mobile) or left (desktop), responsive */}
				<div className="w-full sm:w-1/3 h-48 sm:h-auto rounded-xl overflow-hidden flex-shrink-0 flex items-stretch mr-0 sm:mr-6 mb-4 sm:mb-0">
					<img
						src={team.image_url ?? defaultTeamImage}
						alt={team.name}
						className="object-cover w-full h-full min-h-[180px]"
					/>
				</div>

				{/* Vertical separator only on desktop */}
				<div className="hidden sm:flex items-stretch mx-2"><Separator orientation="vertical" decorative={true} className="h-full" /></div>

				{/* Players list below (mobile) or right (desktop), improved display */}
				<div className="w-full sm:w-2/3 flex flex-col justify-center p-0 sm:p-4 ml-0 sm:ml-2">
					{Object.keys(membersByRole).length === 0 ? (
						<div className="italic text-center w-full col-span-full text-sm">No members yet</div>
					) : (
						<div className="flex flex-col gap-4">
							{Object.entries(membersByRole).map(([role, members]) => (
								<div key={role} className="w-full">
									<span className="font-semibold text-sm mb-2 uppercase tracking-wide text-left block">{role}</span>
									<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
										{(members ?? []).map((member, idx) => (
											<div key={idx} className="flex flex-col items-center">
												<Link to={`/users/$userid`} params={{ userid: String(member?.user.id) }}>
													<img
														src={member?.user?.picture ?? defaultUserImage}
														className="h-16 w-16 object-cover rounded-full border-2 border-gray-300 shadow"
														alt={member?.user?.username}
														title={member?.user?.username}
													/>
												</Link>
												<span className="text-xs mt-2 truncate max-w-[80px] text-center font-medium">{member?.user?.username}</span>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</Card>
	);
}
