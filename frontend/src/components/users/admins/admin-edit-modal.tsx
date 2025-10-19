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
import { MultiSelect } from "@/components/ui/multi-select";
import { useQueryClient as useReactQueryClient } from "@tanstack/react-query";

type User = components["schemas"]["LightUser"];

interface AdminModalProps {
	children?: React.ReactNode
	user: User
}

export default function AdminEditModal({ children, user }: AdminModalProps) {
	const [roles, setRoles] = useState<string[]>(user.roles);
	const [open, setOpen] = useState(false);
	const client = useQueryClient();
	const reactQueryClient = useReactQueryClient();

	const { mutate, isPending } = client.useMutation("post", "/users/{id}/roles", {
		onSuccess: () => {
			toast.success("Admin roles updated successfully");
			setOpen(false);
			if (roles.length == 0) {
				reactQueryClient.invalidateQueries({ queryKey: ["/users"]})
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
					<MultiSelect
						defaultValue={roles}
						options={rbacRoles?.map((role: components['schemas']['Role']) => ({
							value: role.name,
							label: role.name,
						})) ?? []}
						onValueChange={setRoles}
						className="w-full"
					/>
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
