import type { components } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle} from "../../ui/card";
import { Link } from '@tanstack/react-router';

export function TeamCard({team, tournament}: {team: components['schemas']['LightTeam'], tournament: components['schemas']['Tournament']}) {
    console.log(tournament.name)//en attendant


    return (
        <div>
            <div className="text-white">
                
            </div>
            <div className="p-[4px] rounded-xl dark bg-gradient-to-r from-primary to-secondary transition-all duration-300 group hover:scale-[1.02] hover:shadow-xl">
                <Card className="border-0 overflow-hidden rounded-xl bg-gradient-to-b from-black via-gray-800 to-gray-600 ">
                    <CardHeader>
                        <CardTitle>
                            
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="aspect-square flex flex-col items-center justify-center">
                            <div className="flex flex-col items-center">
                                {/* <h3 className="text-lg font-bold">{user.usual_first_name ?? user.first_name} {user.last_name}</h3> */}
                                <h3 className="text-xl font-bold text-white">{team.name}</h3>
                            </div>
                            <div className="p-10">
                                <div className="rounded-full aspect-square size-full overflow-hidden" >
                                    
                                    <img 
                                        src={team.image_url ?? 'https://static.posters.cz/image/750/star-wars-see-no-stormtrooper-i101257.jpg'}
                                        className="object-cover size-full"
                                        alt={team.name}
                                        />
                                </div>
                            </div>
                            {/* <Separator className="bg-gray-800 "></Separator> */}
                            <div className="gap-4 flex justify-between rounded-lg overflow-hidden" >
                                {Array.from({ length: 3 }).map((_, index) => {
                                const member = team.members?.[index];
                                return (
                                    <div key={index} className="rounded-full aspect-square size-full overflow-hidden">                                       
                                        <Link to={`/users/$userid`} params={{ userid: String(member?.user.id) }}>
                                            <img 
                                                src={member?.user?.picture ?? 'https://static.posters.cz/image/750/star-wars-see-no-stormtrooper-i101257.jpg'}
                                                className="hover:cursor-pointer object-cover size-full"
                                                alt={member?.user?.username }
                                                title={member?.user?.username }
                                                />
                                        </Link>
                                    </div>
                                )})}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
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
                            