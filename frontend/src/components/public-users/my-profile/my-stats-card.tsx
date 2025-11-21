import type { components } from "@/lib/api/types";
import { Card, CardContent } from '../../ui/card';

export default function MyStatsCard({user}: {user: components['schemas']['User']}) {

    return (
        <Card className="border-0 bg-gradient-to-t from-gray-800 to-black">
            <CardContent>
                <div className="h-[600px]">
                    <div className="relative">
                        <p className="text-white">STATS</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}