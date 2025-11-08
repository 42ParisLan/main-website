import ActionButton from "@/components/action-button";
import { Card } from "@/components/ui/card";
import useQueryClient from "@/hooks/use-query-client";
import { type components } from "@/lib/api/types";
import { errorModelToDescription } from "@/lib/utils";
import { IconLogout } from '@tabler/icons-react';
import {
  BadgeCheckIcon,
  CalendarIcon,
  ClockIcon,
  LockKeyholeOpenIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

type Consent = components["schemas"]["Consent"];

type ConsentListProps = {
  consents: Consent[];
};

export default function ConsentList({ consents }: ConsentListProps) {
	const client = useQueryClient();
	const [consentsStore, setConsent] = useState(consents);

	const { mutateAsync: deleteConsent } = client.useMutation(
		"delete",
		"/consents/{id}",
		{
		onError: (error) => {
			toast.error(errorModelToDescription(error));
		},
		onSuccess: () => {
			toast.success("Consent revoked");
		},
		},
	);

	const onRevoke = useCallback(
		async (id: number) => {
		await deleteConsent({ params: { path: { id } } });
		setConsent((consents) => consents.filter((c) => c.id !== id));
		},
		[deleteConsent],
	);

	return (
		<ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{consents.length == 0 && (
				<p>No Consents</p>
			)}
			{consentsStore.map((consent) => (
				<li key={consent.id} className="relative">
					<ActionButton
								icon={<IconLogout className="w-4 h-4" />}
								className="absolute top-2 right-2 p-2 z-10 w-8 h-8"
								variant="destructive"
								action={async () => await onRevoke(consent.id)}
							/>
					<Card className="relative p-4 space-y-2 hover:shadow-lg">
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								{consent.application.owner.kind === "admin" && (
									<BadgeCheckIcon className="w-5 h-5 text-purple-500 mr-2" />
								)}
								<a
								href={`/dash/apps/${consent.application.id}`}
								className="hover:underline"
								>
									<h2 className="text-lg font-semibold flex items-center">
										{consent.application.name}
									</h2>
								</a>
							</div>
						</div>
						<span className="text-gray-500">
						Owned By{" "}
							<span className="font-bold">
								{consent.application.owner.username}
							</span>
						</span>
						<p className="mt-2 text-gray-500 w-full truncate">
						{consent.application.description}
						</p>
						<div className="text-gray-500 flex items-center">
							<LockKeyholeOpenIcon className="w-4 h-4 mr-2 flex-shrink-0" />
							<span>Scopes: {consent.scopes.join(", ")}</span>
						</div>
						<div className="text-gray-500 flex items-center">
							<CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
							<span>
								Granted At:{" "}
								{new Date(consent.updated_at).toLocaleString("en-GB")}
							</span>
						</div>
						<div className="text-gray-500 flex items-center">
							<ClockIcon className="w-4 h-4 mr-2 flex-shrink-0" />
							<span>
								Expires At:{" "}
								{new Date(consent.expiration_date).toLocaleString("en-GB")}
							</span>
						</div>
					</Card>
				</li>
			))}
		</ul>
	);
}
