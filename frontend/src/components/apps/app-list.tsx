import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type components } from "@/lib/api/types";
import { BadgeCheckIcon, ExternalLink } from "lucide-react";

type App = components["schemas"]["App"];

type AppListProps = {
	apps: App[];
};

export function AppListSkeleton() {
	return (
		<ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{Array.from({ length: 20 }).map((_, i) => (
			<li key={i}>
			<Card className="p-4 space-y-2">
				<Skeleton className="w-24 h-4" />
				<Skeleton className="w-36 h-4" />
				<Skeleton className="w-48 h-4" />
			</Card>
			</li>
		))}
		</ul>
	);
}

export default function AppList({ apps }: AppListProps) {
	return (
		<ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{apps.length == 0 && (
				<p>No Apps</p>
			)}
			{apps.map((app) => (
				<li key={app.id}>
					<a href={`/admin/apps/${app.id}`}>
						<Card className="p-4 space-y-2 hover:shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer">
							<div className="flex items-center justify-between">
								<div className="flex items-center">
								{app.owner.kind === "admin" && (
									<BadgeCheckIcon className="w-5 h-5 text-purple-500 mr-2" />
								)}
								<h2 className="text-lg font-semibold flex items-center">
									{app.name}
								</h2>
								</div>
								<ExternalLink className="w-4 h-4 text-foreground" />
							</div>
							<span className="text-gray-500">
								Owned By <span className="font-bold">{app.owner.username}</span>
							</span>
						</Card>
					</a>
				</li>
			))}
		</ul>
	);
}
