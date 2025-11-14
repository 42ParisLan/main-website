import type { components } from "@/lib/api/types";
import { Card, CardContent } from '../../ui/card';

export default function MyStatsCard({user}: {user: components['schemas']['User']}) {

    return (
        <Card>
            <CardContent>
                <div className="h-[600px]">
                    <div className="relative">
                        <p>STATS</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}