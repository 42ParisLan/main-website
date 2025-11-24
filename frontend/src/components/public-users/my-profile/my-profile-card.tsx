import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { components } from "@/lib/api/types";
import { Card, CardContent } from '../../ui/card';
import { Button } from "../../ui/button";

export default function MyProfileCard({user}: {user: components['schemas']['User']}) {

    return (
        <Card className="border-0 bg-gradient-to-t from-gray-800 to-black">
            <CardContent>
                <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
                    <div className="relative">
                        <Avatar className="h-24 w-24">
                        <AvatarImage src={user.picture ?? 'https://static.posters.cz/image/750/star-wars-see-no-stormtrooper-i101257.jpg'} alt="Profile" />
                        <AvatarFallback className="text-2xl">JD</AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                            <h1 className="text-2xl font-bold text-white">{user.username}</h1>
                            {user.kind === "admin" && <Badge className="bg-purple-700 text-white" variant="secondary">Admin</Badge>}
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div>
                            <Button className="bg-primary" type="button">Refresh from intra</Button>
                        </div>
                        <div>
                            <Button className="bg-red-700" variant="anonymize" type="button">Anonymize </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// /tournement/$tournamentid page personnel tournois
// /tournament/$tournamentid/register page register/update team tournois
// /tournement/$tournamentid/teams page personnel tournois
// paginatedpage remplace user par team, ex userCard = teamCard user.name team.name etc