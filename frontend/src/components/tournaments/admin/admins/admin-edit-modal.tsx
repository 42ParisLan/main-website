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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdminModalProps {
	children?: React.ReactNode
	admin: components['schemas']['LightTournamentAdmin'];
	tournamentid: number;
	refetchTournament: () => any
}

export default function TournamentAdminEditModal({children, admin, tournamentid, refetchTournament}: AdminModalProps) {
	const [role, setRole] = useState<"ADMIN" | "SUPER_ADMIN">(admin.role);
	const [open, setOpen] = useState(false);
	const client = useQueryClient();

	const { mutate: mutateEdit, isPending: isPendingEdit } = client.useMutation("patch", "/tournaments/{id}/admin/{admin_id}", {
		onSuccess: () => {
			toast.success("Admin roles updated successfully");
			setOpen(false);
			refetchTournament();
		},
		onError: (error: any) => {
			toast.error("Failed to update admin roles");
			console.error(error);
		},
	});

	const { mutate: nutateDelete, isPending: isPendingDelete } = client.useMutation("delete", "/tournaments/{id}/admin/{admin_id}", {
		onSuccess: () => {
			toast.success("Admin deleted successfully");
			setOpen(false);
			refetchTournament();
		},
		onError: (error: any) => {
			toast.error("Failed to delete admin admin");
			console.error(error);
		},
	});

	const handleEditAdmin = useCallback(() => {
		mutateEdit({
			params:{
				path: {
					id: tournamentid,
					admin_id: admin.user.id
				}
			},
			body: role
		})
	}, [mutateEdit, admin.user.id, tournamentid, role])

	const handleDeleteAdmin = useCallback(() => {
		nutateDelete({
			params:{
				path: {
					id: tournamentid,
					admin_id: admin.user.id
				}
			}
		})
	}, [nutateDelete, admin.user.id, tournamentid])

	const roles: components['schemas']['LightTournamentAdmin']["role"][] = ["ADMIN", "SUPER_ADMIN"]

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
						edit admin role or remove user from admin
					</DialogDescription>
				</DialogHeader>
				<div className="py-4">
					<Select value={role} onValueChange={(v) => setRole(v as components['schemas']['LightTournamentAdmin']["role"]) }>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select Role" />
						</SelectTrigger>
						<SelectContent>
							{roles.map((r) => (
								<SelectItem key={r} value={r}>
									{r}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isPendingEdit || isPendingDelete}
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleDeleteAdmin}
						disabled={isPendingDelete}
					>
						{isPendingDelete ? "Deleting..." : "Remove from Admin"}
					</Button>
					<Button
						onClick={handleEditAdmin}
						disabled={isPendingEdit || role == admin.role}
					>
						{isPendingEdit ? "Editing..." : "Edit User"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
