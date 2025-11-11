import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import useQueryClient from "@/hooks/use-query-client";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import type { components } from "@/lib/api/types";
import { CardFooter } from "../ui/card";
import ComponentEdit from "./component/component-edit";
import ComponentCreate from "./component/component-create";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toIsoString, toDatetimeLocal } from "@/lib/date.utils";

interface VoteEditModalProps {
	vote: components['schemas']['Vote'];
	refetchVote: () => any;
}

export default function VoteEdit({ vote, refetchVote }: VoteEditModalProps) {
	const client = useQueryClient();
	const router = useRouter();

	const [isDefault, setIsDefault] = useState<boolean>(true);

	const initialValues = useMemo(() => ({
		title: vote.title ?? "",
		description: vote.description ?? "",
		start_at: toDatetimeLocal(vote.start_at ?? ""),
		end_at: toDatetimeLocal(vote.end_at ?? ""),
		visible: !!vote.visible,
	}), [vote]);

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
		defaultValues: vote,
		onSubmit: async ({ value }) => {
			const body: components["schemas"]["UpdateVote"] = {};
			if (value.title.trim() != initialValues.title) {
				body.title = value.title.trim()
			}
			if (value.description.trim() != initialValues.description) {
				body.description = value.description.trim()
			}
			if (value.start_at != initialValues.start_at) {
				body.start_at = value.start_at
			}
			if (value.end_at != initialValues.end_at) {
				body.end_at = value.end_at
			}
			if (value.visible != initialValues.visible) {
				body.visible = value.visible
			}
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
			refetchVote();
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
								onChange={(e) => {
									const value = e.target.value
									const change = value.trim() == initialValues.title
									setIsDefault(change)
									field.handleChange(value)
								}}
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
								onChange={(e) => {
									const value = e.target.value
									const change = value.trim() == initialValues.description
									setIsDefault(change)
									field.handleChange(value)
								}}
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
									onChange={(e) => {
										const value = toIsoString(e.target.value)
										const change = value == initialValues.start_at
										setIsDefault(change)
										field.handleChange(value)
									}}
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
									onChange={(e) => {
										const value = toIsoString(e.target.value)
										const change = value == initialValues.end_at
										setIsDefault(change)
										field.handleChange(value)
									}}
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
						validators={{
							onChange: ({ value }) => {
								if (value && (vote.components?.length ?? 0) < 2) {
									return "You should have at least two components to make it visible"
								}
								return undefined
							},
						}}
					>
						{(field) => (
							<div className="flex gap-2">
								<Label htmlFor={field.name}>Visible</Label>
								<Input
									id={field.name}
									type="checkbox"
									checked={!!field.state.value}
									onChange={(e) => {
										const value = e.target.checked
										const change = value == initialValues.visible
										setIsDefault(change)
										field.handleChange(value)
									}}
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
						disabled={isDefault || !form.state.canSubmit || isPending || form.state.isSubmitting}
					>
						{isPending || form.state.isSubmitting ? "Editing..." : "Edit Vote"}
					</Button>
				</CardFooter>
			</form>
		</>
	);
}

export function VoteComponentEdit({ vote, refetchVote }: VoteEditModalProps) {
	return (
		<div className="grid md:grid-cols-2 gap-4">
			{vote.components?.map((component) => (
				<ComponentEdit key={component.id} component={component} refetchVote={refetchVote}/>
			))}
			<ComponentCreate voteid={vote.id} refetchVote={refetchVote}/>
		</div>
	)
}


