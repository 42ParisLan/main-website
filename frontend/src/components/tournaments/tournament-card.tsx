import { IconUsersGroup, IconClockHour4Filled } from "@tabler/icons-react";
import { Card, CardContent } from "../ui/card";

export function TournamentCard() {
    return (
        <Card  className="h-full w-full flex flex-col justify-between bg-gray-900 border border-gray-800">
            <CardContent className="">
                <div className=" flex justify-between">
                    <div className="flex items-center justify-center text-xs w-13 h-8 bg-red-700 text-white"> {/*if live red */}
                            <span>LIVE</span>
                    </div>
                    <div className="text-primary">
                        <span>$50,000</span>
                    </div>
                </div>
                <div className="py-8">
                    <h3 className="text-start text-white text-bold">ROCKET LEAGUE</h3>
                    <p className="text-start text-xs text-gray-500">32 teams bla bla bla bla blabla</p>
                </div>
                <div className=" text-white text-xs flex justify-between">
                    <span className="flex items-center gap-1"><IconUsersGroup className="w-4"/>96 Players</span>
                    <span className="flex items-center gap-1"><IconClockHour4Filled className="w-4"/>3h24</span>
                </div>
            </CardContent>
        </Card>
    );
}