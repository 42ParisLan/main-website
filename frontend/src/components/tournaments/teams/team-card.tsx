import type { components } from "@/lib/api/types";
import { Card, CardContent} from "../../ui/card";
import { Link } from '@tanstack/react-router';

export function TeamCard({team, tournament}: {team: components['schemas']['LightTeam'], tournament: components['schemas']['Tournament']}) {
    console.log(tournament.name)//en attendant


    return (
        <div className="min-w-150 p-[4px] rounded-xl dark bg-gradient-to-r from-primary to-secondary transition-all duration-300 group hover:scale-[1.02] hover:shadow-xl">
            <Card className="p-0 border-0 rounded-xl bg-gradient-to-b from-black via-gray-800 to-gray-600 ">
                <CardContent className="gap-12 p-0 flex flex-row items-center justify-start m-3">
                    <div className="">
                        <div className="pr-4">
                            <div className="overflow-hidden relative h-40" >
                                <img 
                                    src={team.image_url ?? 'https://static.posters.cz/image/750/star-wars-see-no-stormtrooper-i101257.jpg'}
                                    className="object-cover h-30 rounded-full"
                                    alt={team.name}
                                    />
                                <h3 className="absolute text-xl font-bold text-white">{team.name}</h3>
                            </div>
                        </div>
                    </div>
                    {/* <Separator className="bg-gray-800 "></Separator> */}
                    <div className="gap-4 flex justify-between rounded-lg" >
                        {Array.from({ length: 3 }).map((_, index) => {
                        const member = team.members?.[index];
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
                            