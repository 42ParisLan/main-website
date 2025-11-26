import type { components } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle} from "../../ui/card";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function TeamCard({teams}: {teams: components['schemas']['LightTeam']}) {
    return (
        <div className="p-[4px] rounded-xl dark bg-gradient-to-r from-primary to-secondary transition-all duration-300 group hover:scale-[1.02] hover:shadow-xl">
            <Card className="border-0 overflow-hidden rounded-xl bg-gradient-to-b from-black via-gray-800 to-gray-600 ">
                <CardContent>
                    <div className="aspect-square flex flex-col items-center justify-center">
                        <div className="flex flex-col items-center">
                            {/* <h3 className="text-lg font-bold">{user.usual_first_name ?? user.first_name} {user.last_name}</h3> */}
                            <h3 className="text-xl font-bold text-white">This is a team</h3>
                        </div>
                        <div className="p-10">
                            <div className="rounded-full aspect-square size-full overflow-hidden" >
                                <img 
                                    src={'https://static.posters.cz/image/750/star-wars-see-no-stormtrooper-i101257.jpg'}
                                    className="object-cover size-full"
                                    alt="malancar"
                                    />
                            </div>
                        </div>
                        <div className="gap-4 flex justify-between rounded-lg overflow-hidden" >
                            {/* composant ProfilePicture */}
                            <div className="rounded-full aspect-square size-full overflow-hidden" onClick={() => (window.location.href = `/users/${user.id}`)}>
                                <img 
                                    // src={user.picture ?? 'https://static.posters.cz/image/750/star-wars-see-no-stormtrooper-i101257.jpg'}
                                    src={'https://friends.42paris.fr/proxy/4ccc5b2275940976896885778a33c54a/medium_malancar.jpg'}

                                    className="hover:cursor-pointer object-cover size-full"
                                    alt="malancar"
                                    title="malancar"
                                    />
                            </div>
                            <div className="rounded-full aspect-square size-full overflow-hidden" onClick={() => (window.location.href = `/users/${user.id}`)}>
                                <img 
                                    // src={user.picture ?? 'https://static.posters.cz/image/750/star-wars-see-no-stormtrooper-i101257.jpg'}
                                    src={'https://friends.42paris.fr/proxy/4ccc5b2275940976896885778a33c54a/medium_malancar.jpg'}

                                    className="hover:cursor-pointer object-cover size-full"
                                    alt="malancar"
                                    title="malancar"
                                    />
                            </div>
                            <div className="rounded-full aspect-square size-full overflow-hidden" onClick={() => (window.location.href = `/users/${user.id}`)}>
                                <img 
                                    // src={user.picture ?? 'https://static.posters.cz/image/750/star-wars-see-no-stormtrooper-i101257.jpg'}
                                    src={'https://friends.42paris.fr/proxy/4ccc5b2275940976896885778a33c54a/medium_malancar.jpg'}

                                    className="hover:cursor-pointer object-cover size-full"
                                    alt="malancar"
                                    title="malancar"
                                    />
                            </div>
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
                        
                        </div>
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
                            