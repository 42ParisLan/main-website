import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import useQueryClient from "@/hooks/use-query-client";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useQueryClient as useReactQueryClient } from "@tanstack/react-query";
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
}

export default function ComponentEdit({ component }: ComponentEditModalProps) {
	// keep modal closed by default (consistent with other modals)
	const [open, setOpen] = useState<boolean>(false);
	const client = useQueryClient();
	const reactQueryClient = useReactQueryClient();

	const {mutate, isPending} = client.useMutation("patch", "/components/{id}", {
		onSuccess: () => {
			toast.success("Component Edited Successfully");
			setOpen(false);
			reactQueryClient.invalidateQueries({ queryKey: ["/votes/{id}"] });
		},
		onError: (error: any) => {
			toast.error("Failed to edit Component for vote");
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
		image_url: component.image_url,
		name: component.name
	}), [component]);

	const form = useForm({
		defaultValues: component,
		onSubmit: async ({ value }) => {
			const body: components["schemas"]["UpdateComponent"] = {};
			if (value.name != initialValues.name) {
				body.name = value.name
			}
			if (value.color != initialValues.color) {
				body.color = value.color
			}
			if (value.description != initialValues.description) {
				body.description = value.description
			}
			if (value.image_url != initialValues.image_url) {
				body.image_url = value.image_url
			}
			await new Promise<void>((resolve, reject) => {
				mutate({
					params: {
						path: {
							id: component.id
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

	const [previewColor, setPreviewColor] = useState<string>(form.state.values.color || "");

	useEffect(() => {
		setPreviewColor(form.state.values.color || "");
	}, [open]);

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
										defaultValue={field.state.value == "" ? undefined : field.state.value}
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
							name="image_url"
						>
							{(field) => (
								<div className="grid gap-2">
									<Label htmlFor={field.name}>Image</Label>
									<Input
										id={field.name}
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										placeholder="https://example.com/image.png"
										required
									/>
									<div
										className="w-full aspect-square rounded-xl overflow-hidden shadow-lg"
										style={{
											background: previewColor == ""
												? 'transparent'
												: `linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.06)), ${previewColor}`,
										}}
									>
										<img
											className="w-full h-full object-cover"
											src={field.state.value == "" ? "https://static.posters.cz/image/750/star-wars-see-no-stormtrooper-i101257.jpg" : field.state.value}
											alt="component preview"
										/>
									</div>
									{field.state.meta.errors?.[0] && (
										<p className="text-destructive text-sm">{field.state.meta.errors[0]}</p>
									)}
								</div>
							)}
						</form.Field>
					</div>

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
							{isPending || form.state.isSubmitting ? "Editing..." : "Edit Component"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}