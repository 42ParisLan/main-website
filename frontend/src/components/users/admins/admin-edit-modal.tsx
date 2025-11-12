import { useCallback, useState } from "react";
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
import useQueryClient from "@/hooks/use-query-client";
import { toast } from "sonner"
import type { components } from "@/lib/api/types";
import { IconUserPlus } from "@tabler/icons-react";
import { MultiSelector, MultiSelectorContent, MultiSelectorInput, MultiSelectorItem, MultiSelectorList, MultiSelectorTrigger } from "@/components/ui/multi-select";

type User = components["schemas"]["LightUser"];

interface AdminModalProps {
	children?: React.ReactNode
	user: User;
	refetchUsers: () => any;
}

export default function AdminEditModal({ children, user, refetchUsers }: AdminModalProps) {
	const [roles, setRoles] = useState<string[]>(user.roles);
	const [open, setOpen] = useState(false);
	const client = useQueryClient();

	const { mutate, isPending } = client.useMutation("post", "/users/{id}/roles", {
		onSuccess: () => {
			toast.success("Admin roles updated successfully");
			setOpen(false);
			if (roles.length == 0) {
				refetchUsers();
			}
		},
		onError: (error: any) => {
			toast.error("Failed to update admin roles");
			console.error(error);
		},
	});

	const { data: rbacRoles } = client.useQuery("get", "/roles");

	const handleEditAdmin = useCallback(() => {
		mutate({
			params:{
				path: {
					id: user.id
				}
			},
			body: roles
		})
	}, [mutate, user.id, roles])

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children || (
					<Button>
						<IconUserPlus className="w-4 h-4 mr-2" />
						Edit Admin
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Edit Admin User</DialogTitle>
					<DialogDescription>
						edit admin roles or remove user from admin
					</DialogDescription>
				</DialogHeader>
				<div className="py-4">
					<MultiSelector
								values={roles}
								onValuesChange={setRoles}
								className="w-full"
							>
						<MultiSelectorTrigger>
						<MultiSelectorInput placeholder="Select Roles" />
						</MultiSelectorTrigger>
						<MultiSelectorContent>
						<MultiSelectorList>
							{rbacRoles?.filter((role: components['schemas']['Role']) => role.name !== "user").map((role) => (
								<MultiSelectorItem key={role.name} value={role.name}>
									{role.name}
								</MultiSelectorItem>
							))}
						</MultiSelectorList>
						</MultiSelectorContent>
					</MultiSelector>
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isPending}
					>
						Cancel
					</Button>
					{roles.length == 0 ? (
						<Button
							variant="destructive"
							onClick={handleEditAdmin}
							disabled={isPending}
						>
							{isPending ? "Adding..." : "Remove from Admin"}
						</Button>
					) : (
						<Button
							onClick={handleEditAdmin}
							disabled={isPending}
						>
							{isPending ? "Adding..." : "Edit User"}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
