import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import useQueryClient from "@/hooks/use-query-client";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient as useReactQueryClient } from "@tanstack/react-query";

interface ComponentCreateModalProps {
	children?: React.ReactNode;
	voteid: number
}

export default function ComponentCreate({ children, voteid }: ComponentCreateModalProps) {
	const [open, setOpen] = useState<boolean>(false);
	const client = useQueryClient();
	const reactQueryClient = useReactQueryClient();

	const {mutate} = client.useMutation("post", "/votes/{id}/components", {
		onSuccess: () => {
			toast.success("Vote Created Successfully");
			setOpen(false);
			reactQueryClient.invalidateQueries({ queryKey: ["/votes/{id}"] });
		},
		onError: (error: any) => {
			toast.error("Failed to create vote");
			console.error(error);
		},
	})

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children || (
					<Button>
						<IconPlus className="w-4 h-4" />
						Create Component
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Create New Component</DialogTitle>
					<DialogDescription>
						Create a choice for a vote
					</DialogDescription>
				</DialogHeader>
				<p>Implement form at /src/components/votes/component/component-create.tsx</p>
				<h1 className="text-lg">Create Choice for vote: {voteid}</h1>
			</DialogContent>
		</Dialog>
	);
}