import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconSettings } from "@tabler/icons-react"
import { PenIcon, RedoDotIcon, RefreshCcw, TrashIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Dispatch, useCallback, useMemo, useState } from "react";
import UserSearch from "@/components/users/user-search";
import { errorModelToDescription, withDelay } from "@/lib/utils";
import { type components } from "@/lib/api/types";
import ActionButton from "@/components/action-button";
import { toast } from "sonner";
import AppForm from "@/components/apps/app/app-form";
import useQueryClient from "@/hooks/use-query-client";
import { useRouter } from "@tanstack/react-router";

type App = components["schemas"]["App"];

type AppActionsProps = {
	app: App;
	setApp: Dispatch<React.SetStateAction<App>>;
};

export default function AppActions({ app, setApp }: AppActionsProps) {
	const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
	const [isRotateDialogOpen, setIsRotateDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

	return (
		<>
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
			<div className="relative flex items-center justify-center ml-2">
				<IconSettings className="w-7 h-7 text-gray-500 hover:text-primary cursor-pointer" />
			</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56 bg-card shadow-lg">
			<DropdownMenuGroup>
				<DropdownMenuItem
				className="cursor-pointer"
				onClick={() => withDelay(() => setIsEditDialogOpen(true), 120)}
				>
				<PenIcon />
				<span>Edit</span>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
				className="cursor-pointer"
				onClick={() => withDelay(() => setIsRotateDialogOpen(true), 120)}
				>
				<RefreshCcw />
				<span>Rotate Secret</span>
				</DropdownMenuItem>
				<DropdownMenuItem
				className="cursor-pointer"
				onClick={() =>
					withDelay(() => setIsTransferDialogOpen(true), 120)
				}
				>
				<RedoDotIcon />
				<span>Transfer Ownership</span>
				</DropdownMenuItem>
			</DropdownMenuGroup>
			<DropdownMenuSeparator />
			<DropdownMenuItem
				className="cursor-pointer text-red-500"
				onClick={() => withDelay(() => setIsDeleteDialogOpen(true), 120)}
			>
				<TrashIcon />
				<span>Delete</span>
			</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
		<TransferOwnerShipDialog
			appID={app.id}
			setApp={setApp}
			isOpen={isTransferDialogOpen}
			setIsOpen={setIsTransferDialogOpen}
		/>
		<RotateSecretDialog
			appID={app.id}
			setApp={setApp}
			isOpen={isRotateDialogOpen}
			setIsOpen={setIsRotateDialogOpen}
		/>
		<DeleteAppDialog
			appID={app.id}
			isOpen={isDeleteDialogOpen}
			setIsOpen={setIsDeleteDialogOpen}
		/>
		<EditAppDialog
			app={app}
			setApp={setApp}
			isOpen={isEditDialogOpen}
			setIsOpen={setIsEditDialogOpen}
		/>
		</>
	);
}

type User = components["schemas"]["LightUser"];

function TransferOwnerShipDialog({
	appID,
	setApp,
	isOpen,
	setIsOpen,
}: {
	appID: string;
	setApp: Dispatch<React.SetStateAction<App>>;
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
}) {
	const [selectedUser, setSelectedUser] = useState<User | null>(null);

	const onUserSelect = useCallback((user: User) => {
		setSelectedUser((prev: User | null) => (prev?.id === user.id ? null : user));
	}, []);

	const selectedUsers = useMemo(() => {
		const set = new Set<number>();
		if (selectedUser) set.add(selectedUser.id);
		return set;
	}, [selectedUser]);

	const client = useQueryClient();

	const { mutateAsync: updateApp } = client.useMutation("patch", "/apps/{id}", {
		onError(error) {
		toast.error(errorModelToDescription(error));
		},
		onSuccess() {
		toast.success("Ownership transferred successfully");
		},
	});

	const onTransfer = useCallback(
		async (user: User) => {
		const app = await updateApp({
			params: {
			path: { id: appID },
			},
			body: { owner_id: user.id },
		});
		if (app) setApp(app);
		setIsOpen(false);
		},
		[appID, setApp, setIsOpen, updateApp],
	);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
		<DialogContent>
			<DialogHeader>
			<DialogTitle>Transfer Ownership</DialogTitle>
			<DialogDescription>
				Transfer ownership of this app to another user.
			</DialogDescription>
			</DialogHeader>
			<div className="space-y-4 h-full">
			<UserSearch
				selectedUsers={selectedUsers}
				onUserSelect={onUserSelect}
			/>
			</div>
			<DialogFooter>
			{selectedUser && (
				<p className="text-sm text-gray-500 w-full p-2">
				You are transferring ownership to{" "}
				<span className="font-semibold">{selectedUser.username}</span>
				</p>
			)}
			<ActionButton
				icon={<RedoDotIcon />}
				action={() => onTransfer(selectedUser!)}
				disabled={!selectedUser}
			>
				Transfer
			</ActionButton>
			</DialogFooter>
		</DialogContent>
		</Dialog>
	);
}

function RotateSecretDialog({
	appID,
	setApp,
	isOpen,
	setIsOpen,
}: {
	appID: string;
	setApp: Dispatch<React.SetStateAction<App>>;
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
}) {
	const client = useQueryClient();

	const { mutateAsync: rotateSecret } = client.useMutation(
		"post",
		"/apps/{id}/rotate-secret",
		{
		onError(error) {
			toast.error(errorModelToDescription(error));
		},
		onSuccess() {
			toast.success("Secret rotated successfully");
		},
		},
	);

	const onRotate = useCallback(async () => {
		const app = await rotateSecret({ params: { path: { id: appID } } });
		setIsOpen(false);
		setApp(app);
	}, [appID, rotateSecret, setApp, setIsOpen]);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
		<DialogContent>
			<DialogHeader>
			<DialogTitle>Rotate Secret</DialogTitle>
			<DialogDescription>
				Rotating the secret will invalidate the current secret and generate
				a new one.
			</DialogDescription>
			</DialogHeader>
			<DialogFooter>
			<ActionButton icon={<RefreshCcw />} action={onRotate}>
				Rotate
			</ActionButton>
			</DialogFooter>
		</DialogContent>
		</Dialog>
	);
}

function DeleteAppDialog({
	appID,
	isOpen,
	setIsOpen,
}: {
	appID: string;
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
}) {
	const client = useQueryClient();
	const router = useRouter();

	const { mutateAsync: deleteApp } = client.useMutation(
		"delete",
		"/apps/{id}",
		{
		onError(error) {
			toast.error(errorModelToDescription(error));
		},
		onSuccess() {
			toast.success("App deleted successfully");
			router.navigate({to: "/admin/apps/me"});
		},
		},
	);

	const onDelete = useCallback(async () => {
		await deleteApp({ params: { path: { id: appID } } });
		setIsOpen(false);
	}, [appID, deleteApp, setIsOpen]);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
		<DialogContent>
			<DialogHeader>
			<DialogTitle>Delete App</DialogTitle>
			<DialogDescription>
				Are you sure you want to delete this app? This action is
				irreversible.
			</DialogDescription>
			</DialogHeader>
			<DialogFooter>
			<ActionButton
				icon={<TrashIcon />}
				action={onDelete}
				variant="destructive"
			>
				Delete
			</ActionButton>
			</DialogFooter>
		</DialogContent>
		</Dialog>
	);
}

type AppPayload = components["schemas"]["AppPayload"];

function EditAppDialog({
	app,
	setApp,
	isOpen,
	setIsOpen,
}: {
	app: App;
	setApp: Dispatch<React.SetStateAction<App>>;
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
}) {
	const client = useQueryClient();
	const { mutateAsync: updateApp } = client.useMutation("put", "/apps/{id}", {
		onError(error) {
		toast.error(errorModelToDescription(error));
		},
		onSuccess(updatedApp) {
		setApp(updatedApp);
		toast.success("App updated successfully");
		},
	});

	const onSubmit = useCallback(
		async (data: AppPayload) => {
		const updatedApp = await updateApp({
			params: { path: { id: app.id } },
			body: data,
		});
		setApp(updatedApp);
		setIsOpen(false);
		},
		[app.id, setApp, setIsOpen, updateApp],
	);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
		<DialogContent className="w-fit max-w-[100vw] max-h-[90vh] overflow-y-auto bg-card">
			<DialogHeader>
			<DialogTitle>Edit App</DialogTitle>
			<DialogDescription>
				You can edit the app details here.
			</DialogDescription>
			</DialogHeader>
			<AppForm appPayload={app} onAppSubmit={onSubmit} />
		</DialogContent>
		</Dialog>
	);
}
