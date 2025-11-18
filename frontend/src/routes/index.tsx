import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/home-page/header'
import { TournamentCard } from '@/components/tournament/tournament-card'


export const Route = createFileRoute('/')({
	component: WelcomePage,
})

function WelcomePage() {
	return (
		<div className="min-h-screen bg-background">
			<div className="">
				<div className="flex flex-col items-center justify-centertext-center">
					<Header/>
					{/* Welcome message  */}
					<div className="pl-3 bg-gradient-to-br from-black via-indigo-900 to-pink-800 w-full h-130 flex flex-col items-start">
						<div className="p-6 w-full h-70">
							<h1 style={{ fontFamily: "Orbitron" }} className="font-orbitron py-3 text-7xl text-left font-bold text-white">COMPETE IN THE <br/> ULTIMATE GAMING <br/> ARENA</h1>
						</div>
						<div style={{ fontFamily: "Orbitron" }}  className="p-6 text-gray-400">
							<p>Join thousands of elite gamers in the most prestigious esports tournaments.
								<br/> Compete for glory, fame and massive prize blablabla.
							</p>
						</div>
						<div className="w-full p-6 flex items-start gap-10">
							<div className="">
								<button className="p-3 bg-gradient-to-r from-[#5AD5FA] to-[#8463F2] text-white">JOIN TOURNAMENT</button>
							</div>
							<div className="p-2.5 text-white border border-2 border-solid border-white">
								<button>WATCH LIVE</button>
							</div>
						</div>
					</div>
					{/* TOURNAMENTS*/}
					<div style={{ fontFamily: "Orbitron" }} className="w-full h-100 bg-gradient-to-br from-black to-gray-800">
						<div className="w-full text-center">
							<h2 className="text-bold text-white p-3 text-3xl">ACTIVE TOURNAMENTS</h2>
							<p className="text-sm text-gray-400">Battle in the most competitive gmaing environment</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}