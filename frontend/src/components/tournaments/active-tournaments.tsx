import { PublicTournamentCard } from '@/components/tournaments/public-tournament-card'

export function ActiveTournaments() {
    return(
        <div style={{ fontFamily: "Orbitron" }} className="w-full h-100 bg-gradient-to-br from-black to-gray-800">
            <div className="w-full text-center">
                <h2 className="text-bold text-white p-3 text-3xl">ACTIVE TOURNAMENTS</h2>
                <p className="text-sm text-gray-400">Battle in the most competitive gmaing environment</p>
            </div>
            <div className="py-8 flex justify-center w-full h-full flex p-4 gap-4">		
                <button onClick={() => (window.location.href = "/tournaments/1")}
                        className="h-50 w-100 transition-all transition-transform duration-200 hover:scale-105">
                    {/* <PublicTournamentCard/> */}
                </button>
               <button onClick={() => (window.location.href = "/tournaments/1")}
                        className="h-50 w-100 transition-all transition-transform duration-200 hover:scale-105">
                    {/* <PublicTournamentCard/> */}
                </button><button onClick={() => (window.location.href = "/tournaments/1")}
                        className="h-50 w-100 transition-all transition-transform duration-200 hover:scale-105">
                    {/* <PublicTournamentCard/> */}
                </button>
            </div>
        </div>
    );
}