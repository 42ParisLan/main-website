import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/home-page/header'
import { TournamentCard } from '@/components/tournament/tournament-card'
import { Footer } from '@/components/home-page/footer'

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
					<div className="pl-3 bg-gradient-to-br from-black via-purple-900 to-pink-300 w-full h-130 flex flex-col items-start">
						<div className="p-6 w-full h-70">
							<h1 style={{ fontFamily: "Orbitron" }} className="font-orbitron py-3 text-7xl text-left font-bold text-white">COMPETE IN THE <br/> <span className="bg-gradient-to-r from-[#78D8F5] via-[#8F71F5] to-pink-300 bg-clip-text text-transparent"> ULTIMATE </span>GAMING <br/> ARENA</h1>
						</div>
						<div style={{ fontFamily: "Orbitron" }}  className="p-6 text-gray-400">
							<p>Join thousands of elite gamers in the most prestigious esports tournaments.
								<br/> Compete for glory, fame and massive prize blablabla.
							</p>
						</div>
						<div className="w-full p-6 flex items-start gap-10">
							<div className="">
								<button className="p-3 bg-gradient-to-r from-[#5AD5FA] to-[#8463F2] text-white transition-all hover:brightness-80">JOIN TOURNAMENT</button>
							</div>
							<div className="p-2.5 text-white border border-2 border-solid border-white hover:bg-white transition-all hover:text-black">
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
						<div className="py-8 flex justify-center w-full h-full flex p-4 gap-4">
							<div className="h-50 w-100 bg-gray-900 border border-gray-800">
								<TournamentCard/>
							</div>
							<div className="h-50 w-100 bg-gray-900 border border-gray-800">
								<TournamentCard/>
							</div><div className="h-50 w-100 bg-gray-900 border border-gray-800">
								<TournamentCard/>
							</div>
						</div>
					</div>
					{/* TOP PLAYERS */}
					
					<Footer/>
				</div>
			</div>
		</div>
	)
}