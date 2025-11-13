import {type components} from "@/lib/api/types"

export default function DefaultTournament({tournament}: {tournament: components['schemas']['Tournament']}) {
	return (
		<p>Welcome to {tournament.name}</p>
	)
}
