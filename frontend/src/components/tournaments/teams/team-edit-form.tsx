import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import defaultTeamImage from "@/assets/default-team.png";
import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import useQueryClient from '@/hooks/use-query-client';
import { toast } from 'sonner';
import errorModelToDescription from '@/lib/utils';
import type { components } from "@/lib/api/types";

export default function TeamEditForm({
	team,
	tournament
}: {
	team: components['schemas']['LightTeam'];
	tournament: components['schemas']['Tournament'];
}) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>(team.image_url ?? "");
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const router = useRouter();
	const client = useQueryClient();

	// Check if registration is still open
	const now = new Date();
	const registrationEnd = tournament?.registration_end ? new Date(tournament.registration_end) : null;
	const canEdit = registrationEnd ? registrationEnd > now : true;

	// Use mutation for updating the team
	const { mutate: mutateUpdateTeam, isPending: isUpdating } = client.useMutation("patch", "/teams/{id}", {
		onSuccess(data) {
			toast.success("Team Successfully updated");
			if (data) {
				router.navigate({
					to: "/tournaments/$tournamentid/$teamid",
					params: {
						tournamentid: tournament.slug,
						teamid: String(data.id),
					},
				});
			}
		},
		onError(error) {
			const errorMessage = errorModelToDescription(error);
			console.error('Error updating team', error);
			toast.error(`Failed to Update Team: ${errorMessage}`);
		},
	});

	const initialValues = useMemo(() => ({
		name: team?.name || "",
		image_url: team?.image_url || "",
	}), [team]);

	const form = useForm({
		defaultValues: {
			name: team?.name || "",
			image: null as File | null,
		},
		onSubmit: async ({ value }) => {
			if (!team) return;
			const formData = new FormData();
			if (value.name !== initialValues.name) {
				formData.append("name", value.name);
			}
			if (selectedFile) {
				formData.append("image", selectedFile);
			}
			mutateUpdateTeam({
				params: {
					path: {
						id: team.id,
					},
				},
				body: formData as any,
			});
		},
	});

	useEffect(() => {
		if (!selectedFile) {
			setPreviewUrl(team?.image_url ?? "");
			return;
		}
		const url = URL.createObjectURL(selectedFile);
		setPreviewUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [selectedFile]);

	if (!canEdit) {
		// Read-only display if registration ended
		return (
			<Card className="p-2 text-white border-0 bg-card max-w-4xl mx-auto w-full">
				<CardContent className="font-bold p-2 flex flex-col items-start gap-6">
					<div className="grid gap-2">
						<Label>Name</Label>
						<span className="text-lg font-semibold">{team.name}</span>
					</div>
					<div className="grid gap-2">
						<Label>Image</Label>
						<div className="w-full max-w-xs aspect-square rounded-xl overflow-hidden shadow-lg bg-muted/10 flex items-center justify-center">
							<img className="w-full h-full object-cover" src={team.image_url || defaultTeamImage} alt="component preview" />
						</div>
					</div>
					<div className="text-sm text-muted-foreground mt-2">Registration is closed. You can no longer edit the team.</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="p-2 text-white border-0 bg-card max-w-4xl mx-auto w-full">
			<CardContent className='font-bold p-2 flex flex-col gap-6'>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="grid gap-6 py-4"
				>
					<form.Field name="name">
						{(field) => (
							<div className="grid gap-2">
								<Label htmlFor={field.name}>Name</Label>
								<Input
									id={field.name}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="Name of the team"
									required
								/>
								{field.state.meta.errors?.[0] && (
									<p className="text-destructive text-sm">{field.state.meta.errors[0]}</p>
								)}
							</div>
						)}
					</form.Field>

					{/* image upload + preview */}
					<form.Field name="image">
						{(field) => (
							<div className="grid gap-2">
								<Label htmlFor="component-image">Image</Label>

								<div className="flex items-center gap-3">
									{/* hidden native input (triggered programmatically) */}
									<input
										id="component-image"
										ref={fileInputRef}
										type="file"
										accept="image/*"
										className="hidden"
										onChange={(e) => {
											const file = e.target.files?.[0] ?? null;
											field.handleChange(file);
											setSelectedFile(file);
										}}
									/>

									<Button
										type="button"
										className="inline-flex"
										variant="secondary"
										onClick={() => fileInputRef.current?.click()}
									>
										Upload image
									</Button>

									{field.state.value && (
										<Button
											type="button"
											variant="ghost"
											onClick={() => {
												field.handleChange(null);
												setSelectedFile(null);
											}}
										>
											Remove
										</Button>
									)}
								</div>

								<div className="w-full max-w-xs aspect-square rounded-xl overflow-hidden shadow-lg bg-muted/10 flex items-center justify-center">
									{previewUrl ? (
										<img className="w-full h-full object-cover" src={previewUrl} alt="component preview" />
									) : (
										<img className="w-full h-full object-cover" src={defaultTeamImage} alt="component preview" />
									)}
								</div>
							</div>
						)}
					</form.Field>

					<div className="flex items-center justify-end">
						<Button type="submit" variant="secondary" disabled={isUpdating} className="w-full sm:w-auto">
							{isUpdating ? 'Updating…' : 'Update Team'}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}