import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AppForm from "./app-form";
import { type components } from "@/lib/api/types";
import { useCallback, useMemo } from "react";
import { errorModelToDescription } from "@/lib/utils";
import { toast } from "sonner";
import useQueryClient from "@/hooks/use-query-client";
import { useRouter } from "@tanstack/react-router";
import { useAuth } from "@/providers/auth.provider";

type AppPayload = components["schemas"]["AppPayload"];

export default function AppCreateButton() {
	const {me: user} = useAuth();

	const defaultApp: components["schemas"]["AppPayload"] = useMemo(() => {
		return {
		name: "",
		description: "",
		roles: user.roles,
		redirect_uris: [],
		implicit_consent: user.kind === "admin",
		};
	}, [user.kind, user.roles]);

	const client = useQueryClient();
	const router = useRouter();
	const { mutateAsync: createApp } = client.useMutation("post", "/apps", {
		onError(error) {
		toast.error(errorModelToDescription(error));
		},
		onSuccess(createdApp) {
		toast.success("App created successfully");
		router.navigate({to: `/admin/apps/${createdApp.id}`});
		},
	});

	const onSubmit = useCallback(
		async (data: AppPayload) => {
		await createApp({
			body: data,
		});
		},
		[createApp],
	);

	return (
		<Dialog>
		<DialogTrigger asChild>
			<Button>
			<PlusCircleIcon className="w-6 h-6 mr-2" />
			Create App
			</Button>
		</DialogTrigger>
		<DialogContent className="w-fit max-w-[100vw] max-h-[90vh] overflow-y-auto bg-card">
			<DialogHeader>
			<DialogTitle>Create App</DialogTitle>
			<DialogDescription>
				Create a new app to interact with the API.
			</DialogDescription>
			</DialogHeader>
			<AppForm appPayload={defaultApp} onAppSubmit={onSubmit} />
		</DialogContent>
		</Dialog>
	);
}
