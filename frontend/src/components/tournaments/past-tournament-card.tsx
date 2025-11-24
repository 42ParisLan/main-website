import { IconUsersGroup, IconClockHour4Filled } from "@tabler/icons-react";
import { Card, CardContent } from "../ui/card";

export function OldTournamentCard() {
    return (
        <Card className="h-full w-full flex flex-col justify-center bg-gray-900 border border-gray-800">
            <CardContent className="">
                <div className="">
                    <h3 className="text-start text-white text-bold">ROCKET LEAGUE</h3>
                    <p className="text-start text-xs text-gray-500">32 teams bla bla bla bla blabla</p>
                </div>

                <div className="py-2 text-white text-xs flex justify-between">
                    <span className="flex items-center gap-1"><IconUsersGroup className="w-4"/>96 Players</span>
                    <span className="flex items-center gap-1"><IconClockHour4Filled className="w-4"/>3h24</span>
                </div>
            </CardContent>
        </Card>
    );
}