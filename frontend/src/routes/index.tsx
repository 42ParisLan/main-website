import { createFileRoute } from '@tanstack/react-router'
import { ActiveTournaments } from '@/components/tournaments/active-tournaments'
import useQueryClient from '@/hooks/use-query-client';
import logo from '@/assets/logo.svg';
import TopUsers from '@/components/users/top-users';


export const Route = createFileRoute('/')({
	component: WelcomePage,
})

function WelcomePage() {

	const client = useQueryClient();

	const {data: tournaments} = client.useQuery("get", "/tournaments", {
		params: {
			query: {
				limit: 3,
				status: "ongoing",
				visible: "visible",
			}
		}
	})

	const { data: users } = client.useQuery('get', '/users', {
		params: {
			query: {
				limit: 10,
			},
		},
	});

	return (
		<div className="flex flex-col items-center bg-background">
			{/* Welcome message  */}
			<div className="hero-gradient px-6 w-full py-10 md:h-130 flex flex-col md:flex-row items-center justify-around gap-8">
				<div className="flex flex-col text-center md:text-left">
					<div className="p-2 w-full">
						<h1 className="py-3 text-3xl md:text-6xl font-bold text-white">42 STUDENT <br/> <span className="arcade bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> GAMING </span> LEAGUE</h1>
					</div>
					<div className="p-2 text-gray-300">
						<p>
							Join students from 42 in epic e-sport tournaments.
							<br/>
							Compete in games like Rocket League, League of Legends,<br/>
							Super Smash Bros., and Counter-Strike.
						</p>
					</div>
				</div>
				<div className="w-1/2 md:w-150">
					<img src={logo} alt="logo"/>
				</div>
			</div>
			<div className="flex flex-col gap-20 items-center w-full tournament-gradient py-20">
				<ActiveTournaments tournaments={tournaments?.items ?? []} />
				<TopUsers users={users?.items ?? []} />
			</div>
		</div>
	)
}