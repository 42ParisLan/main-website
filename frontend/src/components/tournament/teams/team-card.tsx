import type { components } from "@/lib/api/types";
import { Card, CardContent } from "../../ui/card";
import { Button } from '@/components/ui/button';

export default function TeamCard({user}: {user: components['schemas']['User']}) {
    return (
		<Card className="group relative overflow-hidden">
			<CardContent>
				<div className="aspect-square flex flex-col items-center justify-center">
					<div className="flex flex-col items-center">
						{/* <h3 className="text-lg font-bold">{user.usual_first_name ?? user.first_name} {user.last_name}</h3> */}
						<h3 className="text-xl font-bold">This is a team</h3>
					</div>
                    <div className="p-10">
                        <div className="rounded-full aspect-square size-full overflow-hidden" >
                            <img 
                                src={'https://static.posters.cz/image/750/star-wars-see-no-stormtrooper-i101257.jpg'}
                                className="object-cover size-full"
                                alt={user.username}
                            />
					    </div>
                    </div>
					<div className="gap-4 flex justify-between rounded-lg overflow-hidden" >
                        <div className="rounded-full aspect-square size-full overflow-hidden" >
                            <img 
                                src={user.picture ?? 'https://static.posters.cz/image/750/star-wars-see-no-stormtrooper-i101257.jpg'}
                                className="object-cover size-full"
                                alt={user.username}
                            />
					    </div>
                        <div className="rounded-full aspect-square size-full overflow-hidden" >
                            <img 
                                src={user.picture ?? 'https://static.posters.cz/image/750/star-wars-see-no-stormtrooper-i101257.jpg'}
                                className="object-cover size-full"
                                alt={user.username}
                            />
					    </div>
                        <div className="rounded-full aspect-square size-full overflow-hidden" >
                            <img 
                                src={user.picture ?? 'https://static.posters.cz/image/750/star-wars-see-no-stormtrooper-i101257.jpg'}
                                className="object-cover size-full"
                                alt={user.username}
                            />
					    </div>
                     
					</div>
				</div>
			</CardContent>
		</Card>
	);
}