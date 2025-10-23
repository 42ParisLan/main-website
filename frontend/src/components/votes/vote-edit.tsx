import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import useQueryClient from "@/hooks/use-query-client";
import { toast } from "sonner";
import { useQueryClient as useReactQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import type { components } from "@/lib/api/types";
import { CardFooter } from "../ui/card";
import ComponentEdit from "./component/component-edit";
import ComponentCreate from "./component/component-create";
import { useCallback } from "react";
import { useRouter } from "@tanstack/react-router";

interface VoteEditModalProps {
	vote: components['schemas']['Vote'];
}

export default function VoteEdit({ vote }: VoteEditModalProps) {
	const client = useQueryClient();
	const reactQueryClient = useReactQueryClient();
	const router = useRouter();

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
			title: vote.title,
			description: vote.description,
			// Convert API ISO timestamps to input[type="datetime-local"] format
			start_at: toDatetimeLocal(vote.start_at),
			end_at: toDatetimeLocal(vote.end_at),
			visible: vote.visible
		},
		onSubmit: async ({ value }) => {
			const body: components["schemas"]["UpdateVote"] = {
				title: value.title.trim(),
				description: value.description.trim(),
				start_at: toIsoString(value.start_at),
				end_at: toIsoString(value.end_at),
			};
			await new Promise<void>((resolve, reject) => {
				mutate({
					params: {
						path: {
							id: vote.id
						}
					},
					body
				}, {
					onSuccess: () => resolve(),
					onError: (err) => reject(err as any),
				});
			});
		},
	});
	
	const { mutate, isPending } = client.useMutation("patch", "/votes/{id}", {
		onSuccess: () => {
			toast.success("Vote Edited Successfully");
			reactQueryClient.invalidateQueries({ queryKey: ["/votes/{id}"] });
		},
		onError: (error: any) => {
			toast.error("Failed to create vote");
			console.error(error);
		},
	});

	const { mutate: mutateDelete, isPending: isPendingDelete } = client.useMutation("delete", "/votes/{id}", {
		onSuccess: () => {
			toast.success("Vote Deleted Successfully");
			router.navigate({to: "/admin/votes"})
		},
		onError: (error: any) => {
			toast.error("Failed to delete vote");
			console.error(error);
		},
	});

	const handleDelete = useCallback(() => {
		mutateDelete({
			params: {
				path: {
					id: vote.id
				}
			},
		})
	}, [mutate, vote.id])

	return (
		<>
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
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
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
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
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
						name="visible"
					>
						{(field) => (
							<div className="flex gap-2">
								<Label htmlFor={field.name}>Visible</Label>
								<Input
									id={field.name}
									type="checkbox"
									checked={!!field.state.value}
									onChange={(e) => field.handleChange(e.target.checked)}
									onBlur={field.handleBlur}
									className="w-4"
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

				<div className="grid md:grid-cols-2">
					{vote.components?.map((component) => (
						<ComponentEdit component={component}/>
					))}
					<ComponentCreate voteid={vote.id}/>
				</div>

				<CardFooter className="flex justify-end gap-4 mt-2">
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={isPendingDelete}
					>
						{isPendingDelete ? "Deleting..." : "Delete Vote"}
					</Button>
					<Button
						type="submit"
						disabled={!form.state.canSubmit || isPending || form.state.isSubmitting}
					>
						{isPending || form.state.isSubmitting ? "Editing..." : "Edit Vote"}
					</Button>
				</CardFooter>
			</form>
		</>
	);
}

function toIsoString(localDateTime: string): string {
	const d = new Date(localDateTime);
	if (isNaN(d.getTime())) return "";
	return d.toISOString();
}

// Convert an ISO string (UTC) to a value acceptable by input[type="datetime-local"] (local time: YYYY-MM-DDTHH:mm)
function toDatetimeLocal(iso: string): string {
	const d = new Date(iso);
	if (isNaN(d.getTime())) return "";
	// Adjust to local time and format without seconds/Z
	const tzOffset = d.getTimezoneOffset();
	const local = new Date(d.getTime() - tzOffset * 60000);
	return local.toISOString().slice(0, 16);
}
