import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import useQueryClient from "@/hooks/use-query-client";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import type { components } from "@/lib/api/types";
import { useForm } from "@tanstack/react-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import z from "zod";
import { ColorPicker, ColorPickerEyeDropper, ColorPickerHue, ColorPickerSelection, InputColoPicker } from "@/components/ui/shadcn-io/color-picker";
import Color from "color";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ComponentEditModalProps {
	component: components['schemas']['Component'];
	refetchVote: () => any;
}

export default function ComponentEdit({ component, refetchVote }: ComponentEditModalProps) {
	// keep modal closed by default (consistent with other modals)
	const [open, setOpen] = useState<boolean>(false);
	const client = useQueryClient();

	// file upload state (selected file and preview URL)
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>(component.image_url);

	const {mutate, isPending} = client.useMutation("patch", "/components/{id}", {
		onSuccess: () => {
			toast.success("Component Edited Successfully");
			setOpen(false);
			refetchVote();
		},
		onError: (error: any) => {
			toast.error("Failed to edit Component for vote");
			console.error(error);
		},
	})

	const {mutate: mutateDelete, isPending: isPendingDelete} = client.useMutation("delete", "/components/{id}", {
		onSuccess: () => {
			toast.success("Component Deleted Successfully");
			setOpen(false);
			refetchVote();
		},
		onError: (error: any) => {
			toast.error("Failed to delete Component");
			console.error(error);
		},
	})

	const nameFieldSchema = z.string().min(1, "Name is required").max(200, "Max 200 chars");
	const descriptionFieldSchema = z
		.string()
		.min(1, "Description is required")
		.max(2000, "Max 2000 chars");
	const colorFieldSchema = z
		.string()
		.regex(/^$|^#(?:[0-9A-Fa-f]{6})$/, "Invalid hex color (e.g. #fff or #ffffff)")

	const initialValues = useMemo(() => ({
		color: component.color,
		description: component.description,
		id: component.id,
		name: component.name,
		image_url: component.image_url,
	}), [component]);

	const form = useForm({
		defaultValues: {
			color: component.color,
			description: component.description,
			id: component.id,
			name: component.name,
			image: null as File | null
		},
		onSubmit: async ({ value }) => {
			const formData = new FormData();
			if (value.name != initialValues.name) {
				formData.append("name", value.name)
			}
			if (value.color != initialValues.color) {
				formData.append("color", value.color)
			}
			if (value.description != initialValues.description) {
				formData.append("description", value.description)
			}
			console.log(`1: '${previewUrl.toString()}' 2: '${initialValues.image_url}'`)
			if (previewUrl.toString() != initialValues.image_url && value.image) {
				console.log("image changed")
				formData.append("image", value.image);
			}

			mutate({
				params: {
					path: {
						id: component.id
					}
				},
				body: formData as any,
			});
		},
	});

	const [previewColor, setPreviewColor] = useState<string>(component.color || "");

	// Revoke object URL when selectedFile changes or on unmount
	useEffect(() => {
		if (!selectedFile) {
			setPreviewUrl(component.image_url);
			return;
		}
		const url = URL.createObjectURL(selectedFile);
		setPreviewUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [selectedFile]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Card>
				<CardHeader>
					<CardTitle>{component.name}</CardTitle>
					<div className="text-muted-foreground text-sm">{component.description}</div>
				</CardHeader>
				<CardContent>
					<div
						className="w-full aspect-square rounded-xl overflow-hidden shadow-lg mb-2"
						style={{
							background:
								!component.color || component.color === ""
									? 'transparent'
									: `linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.06)), ${component.color}`,
						}}
					>
						<img
							className="w-full h-full object-cover"
							src={
								!component.image_url || component.image_url === ""
									? "https://static.posters.cz/image/750/star-wars-see-no-stormtrooper-i101257.jpg"
									: component.image_url
							}
							alt="component preview"
						/>
					</div>
					<div className="flex flex-col gap-1">
						<span className="text-xs font-semibold">Color:</span>
						<span className="inline-block w-6 h-6 rounded-full border" style={{background: component.color || '#eee'}}></span>
					</div>
				</CardContent>
				<DialogTrigger asChild>
					<Button size="icon" variant="ghost" className="ml-2">
						{/* Use a smaller edit icon instead of plus */}
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit-3"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg>
					</Button>
				</DialogTrigger>
			</Card>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Edit Component</DialogTitle>
					<DialogDescription>
						Edit choice for a vote
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
						name="name"
						validators={{
							onChange: ({ value }) => {
								const r = nameFieldSchema.safeParse(value as string)
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
									placeholder="@Blast"
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
									placeholder="Vote for Blast!"
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
							name="color"
							validators={{
								onChange: ({ value }) => {
									const r = colorFieldSchema.safeParse(value as string)
									return r.success ? undefined : r.error.errors[0]?.message
								},
							}}
						>
							{(field) => (
								<div className="grid gap-2">
									<Label htmlFor={field.name}>Color</Label>
									<ColorPicker
										defaultValue={field.state.value}
										onChange={(value) => {
											try {
												const color = Color(value);
												setPreviewColor(color.hex())
											} catch (error) {

											}
										}}
									>
										<ColorPickerSelection />
										<div className="flex items-center gap-4">
											<ColorPickerEyeDropper />
											<ColorPickerHue />
										</div>
										<InputColoPicker
											onChange={(value: string) => {
												field.handleChange(value)
											}}
										/>
									</ColorPicker>
									{field.state.meta.errors?.[0] && (
										<p className="text-destructive text-sm">{field.state.meta.errors[0]}</p>
									)}
								</div>
							)}
						</form.Field>

						<form.Field
							name="image"
						>
							{(field) => (
								<div className="grid gap-2">
									<Label htmlFor="component-image">Image</Label>
									<input
										id="component-image"
										type="file"
										accept="image/*"
										onChange={(e) => {
											const file = e.target.files?.[0] ?? null;
											field.handleChange(file)
											setSelectedFile(file)
										}}
										className="file-input"
									/>
									<div
										className="w-full aspect-square rounded-xl overflow-hidden shadow-lg"
										style={{
											background: previewColor == ""
												? 'transparent'
												: `linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.06)), ${previewColor}`,
										}}
									>
										{previewUrl ? (
											<img
												className="w-full h-full object-cover"
												src={previewUrl}
												alt="component preview"
											/>
										) : (
											<img
												className="w-full h-full object-cover"
												src="https://static.posters.cz/image/750/star-wars-see-no-stormtrooper-i101257.jpg"
												alt="component preview"
											/>
										)}
									</div>
								</div>
							)}
						</form.Field>
					</div>

					<DialogFooter className="mt-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isPending || form.state.isSubmitting}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={() => {
								if (!confirm('Delete this component? This action cannot be undone.')) return;
								mutateDelete({
									params: {
										path: {
											id: component.id,
										},
									},
								});
							}}
							disabled={isPendingDelete}
						>
							{isPendingDelete ? 'Deleting...' : 'Delete'}
						</Button>
						<Button
							type="submit"
							disabled={!form.state.canSubmit || isPending || form.state.isSubmitting}
						>
							{isPending || form.state.isSubmitting ? "Editing..." : "Edit Component"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}