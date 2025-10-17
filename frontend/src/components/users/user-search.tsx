import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import useQueryClient from "@/hooks/use-query-client";
import type { components } from "@/lib/api/types";

type User = components["schemas"]["LightUser"];

interface UserSearchProps {
	selectedUsers: Set<number>;
	onUserSelect: (user: User) => void;
	kind?: "basic" | "admin";
}

export default function UserSearch({ selectedUsers, onUserSelect, kind = undefined }: UserSearchProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const client = useQueryClient();

	const { data: users = [] } = client.useQuery("get", "/users", {
		params: {
			query: {
				query: searchQuery,
				limit: 20,
				kind,
			},
		},
	});

	return (
		<div className="space-y-4">
			<Input
				placeholder="Search users..."
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
			/>
			<div className="max-h-60 overflow-y-auto space-y-2">
				{users.map((user) => (
				<div
					key={user.id}
					onClick={() => onUserSelect(user)}
					className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
					selectedUsers.has(user.id)
						? "bg-primary/10 border-primary"
						: "hover:bg-muted"
					}`}
				>
					<Avatar className="h-8 w-8 mr-3">
					<div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
						{user.username[0].toUpperCase()}
					</div>
					</Avatar>
					<div>
					<p className="font-medium">{user.username}</p>
					</div>
				</div>
				))}
				{searchQuery && users.length === 0 && (
				<p className="text-muted-foreground text-sm">No users found</p>
				)}
			</div>
		</div>
	);
}
