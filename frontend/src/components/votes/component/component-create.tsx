import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import useQueryClient from "@/hooks/use-query-client";
import { IconPlus } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import z from "zod";
import { ColorPicker, ColorPickerEyeDropper, ColorPickerHue, ColorPickerSelection, InputColoPicker } from "@/components/ui/shadcn-io/color-picker";
import Color from "color";

interface ComponentCreateModalProps {
	children?: React.ReactNode;
	voteid: number;
	refetchVote: () => any;
}

export default function ComponentCreate({ children, voteid, refetchVote }: ComponentCreateModalProps) {
	// keep modal closed by default (consistent with other modals)
	const [open, setOpen] = useState<boolean>(false);
	const client = useQueryClient();

	// file upload state (selected file and preview URL)
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>("");

	const {mutate, isPending} = client.useMutation("post", "/votes/{id}/components", {
		onSuccess: () => {
			toast.success("Component Created Successfully");
			setOpen(false);
			refetchVote();
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
			name: "",
			image: null as File | null,
		},
		onSubmit: async ({ value }) => {
			const formData = new FormData();
			formData.append("color", value.color);
			formData.append("description", value.description);
			formData.append("name", value.name);
			if (value.image) formData.append("image", value.image);

			mutate({
				params: {
					path: {
						id: voteid,
					},
				},
				body:formData as any
			});
		},
	});

	const [previewColor, setPreviewColor] = useState<string>("");

	useEffect(() => {
		setPreviewColor(form.state.values.color || "");
	}, [open]);

	// Revoke object URL when selectedFile changes or on unmount
	useEffect(() => {
		if (!selectedFile) {
			setPreviewUrl("");
			return;
		}
		const url = URL.createObjectURL(selectedFile);
		setPreviewUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [selectedFile]);

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
							type="submit"
							disabled={!form.state.canSubmit || isPending || form.state.isSubmitting}
						>
							{isPending || form.state.isSubmitting ? "Creating..." : "Create Component"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}