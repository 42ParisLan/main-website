import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UserSearch from "@/components/users/user-search";
import useQueryClient from "@/hooks/use-query-client";
import type { components } from "@/lib/api/types";
import { IconUserPlus } from "@tabler/icons-react";

type User = components["schemas"]["LightUser"];

interface AdminModalProps {
	children?: React.ReactNode;
}

export default function AdminModal({ children }: AdminModalProps) {
	const [open, setOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
	const client = useQueryClient();
	
	const { mutate, isPending } = client.useMutation("post", "/users/{id}/kind", {
		onSuccess: () => {
			setOpen(false);
			setSelectedUser(null);
			setSelectedUsers(new Set());
		},
	});

	const handleUserSelect = (user: User) => {
		setSelectedUser(user);
		setSelectedUsers(new Set([user.id]));
	};

	const handleAddAdmin = () => {
		if (!selectedUser) return;

		mutate({
			params: {
				query: {
					kind: "admin",
				},
				path: {
					id: selectedUser.id,
				},
			},
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children || (
					<Button>
						<IconUserPlus className="w-4 h-4 mr-2" />
						Add Admin
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Add New Admin</DialogTitle>
					<DialogDescription>
						Search for a user and promote them to admin status.
					</DialogDescription>
				</DialogHeader>
				<div className="py-4">
					<UserSearch
						selectedUsers={selectedUsers}
						onUserSelect={handleUserSelect}
						kind="basic"
					/>
					{selectedUser && (
						<div className="mt-4 p-3 bg-muted rounded-md">
							<p className="text-sm font-medium">Selected user:</p>
							<p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
						</div>
					)}
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button
						onClick={handleAddAdmin}
						disabled={!selectedUser || isPending}
					>
						{isPending ? "Adding..." : "Add as Admin"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
