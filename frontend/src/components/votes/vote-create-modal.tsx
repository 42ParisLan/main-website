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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import useQueryClient from "@/hooks/use-query-client";
import { toast } from "sonner";
import { IconPlus } from "@tabler/icons-react";
import { useQueryClient as useReactQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import type { components } from "@/lib/api/types";
import { toIsoString, toDatetimeLocal } from "@/lib/date.utils";

interface VoteCreateModalProps {
	children?: React.ReactNode;
}

export default function VoteCreateModal({ children }: VoteCreateModalProps) {
	const [open, setOpen] = useState(false);
	const client = useQueryClient();
	const reactQueryClient = useReactQueryClient();

	// Zod schemas for field-level validation

	const titleFieldSchema = z.string().min(1, "Title is required").max(200, "Max 200 chars");
	const descriptionFieldSchema = z
		.string()
		.min(1, "Description is required")
		.max(2000, "Max 2000 chars");
	const dateFieldSchema = z
		.string()
		.min(1, "Date is required")
		.refine((v) => !isNaN(new Date(v).getTime()), "Invalid date");

	const form = useForm({
		defaultValues: {
			title: "",
			description: "",
			start_at: "",
			end_at: "",
		},
		onSubmit: async ({ value }) => {
			const body: components["schemas"]["CreateVote"] = {
				title: value.title.trim(),
				description: value.description.trim(),
				start_at: value.start_at,
				end_at: value.end_at,
			};
			await new Promise<void>((resolve, reject) => {
				mutate({ body }, {
					onSuccess: () => resolve(),
					onError: (err) => reject(err as any),
				});
			});
		},
	});
	
	const { mutate, isPending } = client.useMutation("post", "/votes", {
		onSuccess: () => {
			toast.success("Vote Created Successfully");
			setOpen(false);
			reactQueryClient.invalidateQueries({ queryKey: ["/votes"] });
		},
		onError: (error: any) => {
			toast.error("Failed to create vote");
			console.error(error);
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children || (
					<Button>
						<IconPlus className="w-4 h-4" />
						Create Vote
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Create New Vote</DialogTitle>
					<DialogDescription>
						Choose parameters for the vote, the option will be defined in a next step
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="grid gap-4 py-2"
				>
					<form.Field
						name="title"
						validators={{
							onChange: ({ value }) => {
								const r = titleFieldSchema.safeParse(value as string)
								return r.success ? undefined : r.error.errors[0]?.message
							},
						}}
					>
						{(field) => (
							<div className="grid gap-2">
								<Label htmlFor={field.name}>Title</Label>
								<Input
									id={field.name}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="MVP of the game"
									required
								/>
								{field.state.meta.errors?.[0] && (
									<p className="text-destructive text-sm">{field.state.meta.errors[0]}</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field
						name="description"
						validators={{
							onChange: ({ value }) => {
								const r = descriptionFieldSchema.safeParse(value as string)
								return r.success ? undefined : r.error.errors[0]?.message
							},
						}}
					>
						{(field) => (
							<div className="grid gap-2">
								<Label htmlFor={field.name}>Description</Label>
								<Textarea
									id={field.name}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="Vote for your favorite language!"
									rows={4}
									required
								/>
								{field.state.meta.errors?.[0] && (
									<p className="text-destructive text-sm">{field.state.meta.errors[0]}</p>
								)}
							</div>
						)}
					</form.Field>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<form.Field
							name="start_at"
							validators={{
								onChange: ({ value }) => {
									const r = dateFieldSchema.safeParse(value as string)
									return r.success ? undefined : r.error.errors[0]?.message
								},
							}}
						>
							{(field) => (
								<div className="grid gap-2">
									<Label htmlFor={field.name}>Start date</Label>
									<Input
										id={field.name}
										type="datetime-local"
										value={toDatetimeLocal(field.state.value)}
										onChange={(e) => field.handleChange(toIsoString(e.target.value))}
										onBlur={field.handleBlur}
										required
									/>
									{field.state.meta.errors?.[0] && (
										<p className="text-destructive text-sm">{field.state.meta.errors[0]}</p>
									)}
								</div>
							)}
						</form.Field>

						<form.Field
							name="end_at"
							validators={{
								onChange: ({ value }) => {
									const r = dateFieldSchema.safeParse(value as string)
									if (!r.success) return r.error.errors[0]?.message
									// cross-field check
									const start = new Date(form.state.values.start_at)
									const end = new Date(value as string)
									if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end <= start) {
										return "End date must be after start date"
									}
									return undefined
								},
							}}
						>
							{(field) => (
								<div className="grid gap-2">
									<Label htmlFor={field.name}>End date</Label>
									<Input
										id={field.name}
										type="datetime-local"
										value={toDatetimeLocal(field.state.value)}
										onChange={(e) => field.handleChange(toIsoString(e.target.value))}
										onBlur={field.handleBlur}
										required
									/>
									{field.state.meta.errors?.[0] && (
										<p className="text-destructive text-sm">{field.state.meta.errors[0]}</p>
									)}
								</div>
							)}
						</form.Field>
					</div>

					<p className="text-xs text-muted-foreground">
						Dates are interpreted in your local timezone and saved in UTC.
					</p>
					<DialogFooter className="mt-2">
						<Button
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isPending || form.state.isSubmitting}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!form.state.canSubmit || isPending || form.state.isSubmitting}
						>
							{isPending || form.state.isSubmitting ? "Creating..." : "Create Vote"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

