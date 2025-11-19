import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/home-page/header'
import { ActiveTournaments } from '@/components/tournaments/active-tournaments'

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
					<div className="pl-3 bg-gradient-to-br from-black via-primary to-secondary w-full h-130 flex flex-col items-start">
						<div className="p-6 w-full h-70">
							<h1 style={{ fontFamily: "Orbitron" }} className="font-orbitron py-3 text-7xl text-left font-bold text-white">COMPETE IN THE <br/> <span className="bg-gradient-to-r from-[#78D8F5] via-[#8F71F5] to-pink-300 bg-clip-text text-transparent"> ULTIMATE </span>GAMING <br/> ARENA</h1>
						</div>
						<div style={{ fontFamily: "Orbitron" }}  className="p-6 text-gray-300">
							<p>Join thousands of elite gamers in the most prestigious esports tournaments.
								<br/> Compete for glory, fame and massive prize blablabla.
							</p>
						</div>
						<div className="w-full p-6 flex items-start gap-10">
							<div className="">
								<button className="p-3 border border-2 border-solid border-secondary hover:bg-secondary transition-all hover:text-white text-secondary transition-all ">JOIN TOURNAMENT</button>
							</div>
							{/* <div className="p-2.5 text-white border border-2 border-solid border-white hover:bg-white transition-all hover:text-black">
								<button>WATCH LIVE</button>
							</div> */}
						</div>
					</div>
					{/* TOURNAMENTS*/}
					<ActiveTournaments/>
					{/* TOP PLAYERS */}
					
					<Footer/>
				</div>
			</div>
		</div>
	)
}