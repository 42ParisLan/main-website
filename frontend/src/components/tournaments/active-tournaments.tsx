import  PublicTournamentCard  from '@/components/tournaments/public-tournament-card'
import {type components} from "@/lib/api/types"


export function ActiveTournaments({tournaments}: {tournaments: components['schemas']['LightTournament'][]}) {
    return(
        <div style={{ fontFamily: "Orbitron" }} className="w-full h-100 bg-gradient-to-br from-black to-gray-800">
                    <div className="w-full text-center">
                        <h2 className="text-bold text-white p-3 text-3xl">ACTIVE TOURNAMENTS</h2>
                        <p className="text-sm text-gray-400">Battle in the most competitive gaming environment</p>
                    </div>
                    <div className="py-8 flex justify-center w-full h-full flex p-4 gap-4">
                        <div className="h-50 w-100 transition-all transition-transform duration-200 hover:scale-105">
                            {tournaments.length > 0 && (
                            <>
                                <PublicTournamentCard tournament={tournaments[0]}/>
                            </>
                        )}
                        </div>
                        
                       <div className="h-50 w-100 transition-all transition-transform duration-200 hover:scale-105">
                            {tournaments.length > 1 && (
                            <>
                                <PublicTournamentCard tournament={tournaments[1]}/>
                            </>
                        )}
                        </div><div className="h-50 w-100 transition-all transition-transform duration-200 hover:scale-105">
                            {tournaments.length > 2 && (
                            <>
                                <PublicTournamentCard tournament={tournaments[2]}/>
                            </>
                        )}
                        </div>
                    </div>
                </div>
        // <div style={{ fontFamily: "Orbitron" }} className="bg-gradient-to-br from-black to-gray-800">
        //     <div className="w-full text-center">
        //         <h2 className="text-bold text-white p-3 text-3xl">ACTIVE TOURNAMENTS</h2>
        //         <p className="text-sm text-gray-400">Battle in the most competitive gmaing environment</p>
        //     </div>
        //     <div className=" pt-8 flex justify-center w-full h-full">		
        //         <div className="p-2 h-full transition-all transition-transform duration-200 hover:scale-105">
        //             {tournaments.length > 0 && (
        //                 <>
        //                     <PublicTournamentCard tournament={tournaments[0]} />
        //                 </>
        //             )}
        //         </div>
        //     <div className="p-2 h-full transition-all transition-transform duration-200 hover:scale-105">
        //             {tournaments.length > 1 && (
        //                 <>
        //                     <PublicTournamentCard tournament={tournaments[1]} />
        //                 </>
        //             )}
        //         </div>
        //     <div className="p-2 h-full transition-all transition-transform duration-200 hover:scale-105">
        //             {tournaments.length > 2 && (
        //                 <>
        //                     <PublicTournamentCard tournament={tournaments[2]} />
        //                 </>
        //             )}
        //         </div>
        //     </div>
        // </div>
    );
}