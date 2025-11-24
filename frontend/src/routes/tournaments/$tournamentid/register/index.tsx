import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectGroup, SelectLabel, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import useQueryClient from '@/hooks/use-query-client'
import { useForm } from '@tanstack/react-form';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect, useState, useMemo, useRef } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/tournaments/$tournamentid/register/')({
  component: RouteComponent,
})

function RouteComponent() {
	const {tournamentid} = Route.useParams();
	const client = useQueryClient();
	const router = useRouter();

	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>("");

	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const { data: tournament, isLoading: isLoadingTournament, isError: isErrorTournament } = client.useQuery("get", "/tournaments/{id_or_slug}", {
		params: {
			path: {
				id_or_slug: tournamentid,
			},
		},
	})

	const { data: team } = client.useQuery("get", "/tournaments/{id}/me/team", {
		params: {
			path: {
				id: tournament?.id ?? 0,
			},
		},
		enabled: !!tournament?.id,
	})

	const { mutate: mutateCreateTeam, isPending: isCreating } = client.useMutation("post", "/tournaments/{id}/teams", {
		onSuccess(data) {
			toast.success("Team Successfuly created")
			if (data && tournament) {
				router.navigate({
					to: "/tournaments/$tournamentid/$teamid",
					params: {
						tournamentid: String(tournament.id),
						teamid: String(data.id),
					},
				})
			}
		},
		onError(error) {
			console.error('Error creating team', error)
			toast.error("Failed to Create Team")
		}
	})  

	useEffect(() => {
		if (isErrorTournament) {
			router.navigate({ to: "/tournaments" })
		}
	}, [isErrorTournament, router])

	useEffect(() => {
		if (team && tournament) {
			router.navigate({
				to: "/tournaments/$tournamentid/$teamid",
				params: {
					tournamentid: tournament.slug,
					teamid: String(team.id),
				},
			})
		}
	}, [team, tournament, router])
	
	const form = useForm({
		defaultValues: {
			creator_status: "",
			name: "",
			image: null as File | null,
		},
		onSubmit: async ({ value }) => {
			if (!tournament) return
			const formData = new FormData();
			formData.append("creator_status", value.creator_status)
			formData.append("name", value.name)
			if (value.image) formData.append("image", value.image);
			mutateCreateTeam({
				params: {
					path: {
						id: tournament?.id
					}
				},
				body: formData as any
			});
		},
	});

	useEffect(() => {
		if (!selectedFile) {
			setPreviewUrl("");
			return;
		}
		const url = URL.createObjectURL(selectedFile);
		setPreviewUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [selectedFile]);

	const roles = useMemo(() => {
		return Object.keys(tournament?.team_structure ?? {});
	}, [tournament?.team_structure])

	if (isLoadingTournament) {
		return <div className="text-sm text-muted-foreground">Loading tournament…</div>
	}

	if (isErrorTournament) {
		return null
	}

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Create Team</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						className="grid gap-6 py-4"
					>
						{/* two-column layout on wider screens for compactness */}
						<div className="grid gap-4 sm:grid-cols-2">
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

							<form.Field name="creator_status">
								{(field) => (
									<div className="grid gap-2">
										<Label htmlFor={field.name}>Your Role</Label>
										<Select
											value={field.state.value}
											onValueChange={(value) => field.handleChange(value)}
										>
											<SelectTrigger className="w-full sm:w-[220px]">
												<SelectValue placeholder="Select a role" />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													<SelectLabel>Roles</SelectLabel>
													{roles.map((role) => (
														<SelectItem key={role} value={role}>
															{role}
														</SelectItem>
													))}
												</SelectGroup>
											</SelectContent>
										</Select>
										{field.state.meta.errors?.[0] && (
											<p className="text-destructive text-sm">{field.state.meta.errors[0]}</p>
										)}
									</div>
								)}
							</form.Field>
						</div>

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
											<div className="text-center p-4 text-sm text-muted-foreground">No image selected</div>
										)}
									</div>
								</div>
							)}
						</form.Field>

						<div className="flex items-center justify-end">
							<Button type="submit" disabled={isCreating} className="w-full sm:w-auto">
								{isCreating ? 'Creating…' : 'Create Team'}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</>
	)
}
