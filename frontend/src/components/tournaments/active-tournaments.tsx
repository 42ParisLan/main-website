import  PublicTournamentCard  from '@/components/tournaments/public-tournament-card'
import {type components} from "@/lib/api/types"
import { Button } from '../ui/button';
import { Link } from '@tanstack/react-router';

export function ActiveTournaments({tournaments}: {tournaments: components['schemas']['LightTournament'][]}) {
    return(
        <div style={{ fontFamily: "Orbitron" }} className="w-full h-100 bg-gradient-to-br from-black to-gray-800">
            <div className="w-full text-center">
                <h2 className="text-bold text-white p-3 text-3xl">ACTIVE TOURNAMENTS</h2>
                <p className="text-sm text-gray-400">Battle in the most competitive gmaing environment</p>
            </div>
            <div className="py-8 flex justify-center w-full h-full flex p-4 gap-4">		
                {tournaments.length > 0 && (
                    <>
                        <Button asChild size="xl" variant="gradient" className="p-3">
                        <Link to="/tournaments/$tournamentid" params={{tournamentid: String(tournaments[0].id)}}></Link>
                        </Button>
                        <button onClick={() => (window.location.href = "/tournaments/1")}
                                className="h-50 w-100 transition-all transition-transform duration-200 hover:scale-105">
                            <PublicTournamentCard tournament={tournaments[0]} />
                        </button>
                    </>
                )}
               {tournaments.length > 1 && (
                    <>
                        <Button asChild size="xl" variant="gradient" className="p-3">
                        <Link to="/tournaments/$tournamentid" params={{tournamentid: String(tournaments[1].id)}}></Link>
                        </Button>
                        <button onClick={() => (window.location.href = "/tournaments/1")}
                                className="h-50 w-100 transition-all transition-transform duration-200 hover:scale-105">
                            <PublicTournamentCard tournament={tournaments[1]} />
                        </button>
                    </>
                )}
                {tournaments.length > 2 && (
                    <>
                        <Button asChild size="xl" variant="gradient" className="p-3">
                        <Link to="/tournaments/$tournamentid" params={{tournamentid: String(tournaments[2].id)}}></Link>
                        </Button>
                        <button onClick={() => (window.location.href = "/tournaments/1")}
                                className="h-50 w-100 transition-all transition-transform duration-200 hover:scale-105">
                            <PublicTournamentCard tournament={tournaments[2]} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}