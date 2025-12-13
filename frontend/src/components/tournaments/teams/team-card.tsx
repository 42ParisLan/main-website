import type { components } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle} from "../../ui/card";
import { Link } from '@tanstack/react-router';

export function TeamCard({team, tournament}: {team: components['schemas']['LightTeam'], tournament: components['schemas']['Tournament']}) {
    console.log(tournament.name)//en attendant


    return (
        <div className="flex flex-col items-center gap-6">
            <Card className="bg-card w-full max-w-xl md:max-w-2xl lg:max-w-4xl ">
                {/* nom tournois moins visible moins gros */}
                <CardHeader className="">
                    <CardTitle className="text-center text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {tournament.name} tournament
                        {/* link vers tournament */}
                    </CardTitle>
                </CardHeader>
            </Card>
            <Card className="bg-card min-w-150 max-w-xl md:max-w-2xl lg:max-w-4xl">
                <CardContent className="gap-12 p-0 flex flex-row items-center justify-start m-3">
                    <div className="">
                        <div className="pr-4">
                            <div className="p-0 h-50 border-none rounded-xl overflow-hidden" >
                                <img 
                                    src={team.image_url ?? 'https://static.posters.cz/image/750/star-wars-see-no-stormtrooper-i101257.jpg'}
                                    className="rounded-xl w-full h-full transition-transform duration-300 group-hover:scale-110"
                                    alt={team.name}
                                    />
                                <h3 className="absolute text-xl font-bold text-white">{team.name}</h3>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                            <h3 className="text-lg font-bold text-white truncate">
                                {tournament.name}
                            </h3>
                        </div>
                    </div>
                    {/* <Separator className="bg-gray-800 "></Separator> */}
                    <div className="gap-4 flex justify-between rounded-lg" >
                      {Array.isArray(team.members) && team.members.map((member, index) => {
                        return (
                            <div key={index} className="text-center">
                                <span className="p-3 text-sm text-white font-bold text-center">{member?.role}</span>
                                <Link to={`/users/$userid`} params={{ userid: String(member?.user.id) }} className=" overflow-hidden">
                                    <img 
                                        src={member?.user?.picture ?? 'https://static.posters.cz/image/750/star-wars-see-no-stormtrooper-i101257.jpg'}
                                        className="h-20 w-20 hover:cursor-pointer object-cover rounded-full"
                                        alt={member?.user?.username }
                                        title={member?.user?.username }
                                        />
                                </Link>
                                <span className="p-3 text-sm text-white">{member?.user?.username}</span>
                            </div>
                        )})}
                    </div>
                </CardContent>
            </Card>
        </div>
	);
}

                                {/* <div className="rounded-full aspect-square size-full overflow-hidden"  onClick={() => (window.location.href = `/users/${user.id}`)}>
                                    <img 
                                        src={user.picture ?? 'https://static.posters.cz/image/750/star-wars-see-no-stormtrooper-i101257.jpg'}
                                        className="hover:cursor-pointer object-cover size-full"
                                        alt={user.username}
                                        title={user.username}

                                        />
                                </div>
                                <div className="rounded-full aspect-square size-full overflow-hidden"  onClick={() => (window.location.href = `/users/${user.id}`)}>
                                    <img 
                                        src={user.picture ?? 'https://static.posters.cz/image/750/star-wars-see-no-stormtrooper-i101257.jpg'}
                                        className="hover:cursor-pointer object-cover size-full"
                                        title={user.username}
                                        alt={user.username}
                                        />
                                </div> */}
                            