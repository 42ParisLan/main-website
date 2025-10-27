import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import useQueryClient from "@/hooks/use-query-client";
import { IconPlus } from "@tabler/icons-react";
import { useState, useEffect } from "react";
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

interface ComponentCreateModalProps {
	children?: React.ReactNode;
	voteid: number
}

export default function ComponentCreate({ children, voteid }: ComponentCreateModalProps) {
	// keep modal closed by default (consistent with other modals)
	const [open, setOpen] = useState<boolean>(false);
	const client = useQueryClient();
	const reactQueryClient = useReactQueryClient();

	const {mutate, isPending} = client.useMutation("post", "/votes/{id}/components", {
		onSuccess: () => {
			toast.success("Component Created Successfully");
			setOpen(false);
			reactQueryClient.invalidateQueries({ queryKey: ["/votes/{id}"] });
		},
		onError: (error: any) => {
			toast.error("Failed to create Component for vote");
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

	const form = useForm({
		defaultValues: {
			color: "",
			description: "",
			image_url: "",
			name: "",
		},
		onSubmit: async ({ value }) => {
			const body: components["schemas"]["CreateComponent"] = {
				color: value.color,
				description: value.description,
				image_url: value.image_url,
				name: value.name,
			};
			await new Promise<void>((resolve, reject) => {
				mutate({
					params: {
						path: {
							id: voteid
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
							{isPending || form.state.isSubmitting ? "Creating..." : "Create Vote"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}