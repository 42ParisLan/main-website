import useQueryClient from "@/hooks/use-query-client";
import errorModelToDescription from "@/lib/utils";
import { useRouter } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import type { components } from "@/lib/api/types";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../ui/select";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../ui/button";
import { toDatetimeLocal, toIsoString } from "@/lib/date.utils";
import { z } from "zod";

export default function TournamentCreate() {
	const router = useRouter();
	const client = useQueryClient();

	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>("");

	useEffect(() => {
		if (!selectedFile) {
			setPreviewUrl("");
			return;
		}
		const url = URL.createObjectURL(selectedFile);
		setPreviewUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [selectedFile]);

	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const {mutate, isPending} = client.useMutation("post", "/tournaments", {
		onSuccess(data) {
			console.log("Tournament created successfully")
			router.navigate({to : `/admin/tournaments/${data.id}`})
		},
		onError(error) {
			console.error(`Error while creating Tournament ${error}`)
			const errorMessage = errorModelToDescription(error);
			toast.error(`Error while creating Tournament: ${errorMessage}`)
		}
	})

	const form = useForm({
		defaultValues: {
			custom_page_component: undefined as string | undefined,
			description: "",
			max_teams: 0,
			name: "",
			registration_end: "",
			registration_start: "",
			tournament_start: "",
			image: null as File | null,
		},
		onSubmit: async ({ value }) => {
			let team_structure: components["schemas"]["Tournament"]["team_structure"] = {}
			if (teamRoles.length > 0) {
				for (const r of teamRoles) {
					if (!r.name || r.min === "" || r.max === "") {
						toast.error("Each role must have a name, min and max")
						return
					}
					const min = Number(r.min)
					const max = Number(r.max)
					if (Number.isNaN(min) || Number.isNaN(max) || min > max) {
						toast.error("Invalid min/max for role " + r.name)
						return
					}
					team_structure[r.name] = { min, max }
				}
			}

			const formData = new FormData();

			if (value.custom_page_component) formData.append('custom_page_component', String(value.custom_page_component));
			if (value.image) formData.append("image", value.image);
			formData.append('description', String(value.description ?? ''));
			formData.append('max_teams', String(value.max_teams ?? 0));
			formData.append('name', String(value.name ?? ''));
			formData.append('registration_end', String(value.registration_end ?? ''));
			formData.append('registration_start', String(value.registration_start ?? ''));
			formData.append('slug', String((value.name ?? '').toLocaleLowerCase().replaceAll(' ', '-')));
			formData.append('tournament_start', String(value.tournament_start ?? ''));
			formData.append('team_structure', JSON.stringify(team_structure));

			mutate({ body: formData as any });
		},
	});

	const modules = import.meta.glob('../custom-pages/*.tsx', { eager: true })

	const pages = useMemo(() => {
		return Object.keys(modules).map((p) => p.split('/').pop()?.replace('.tsx', '') || p)
	}, [modules])

	const dateFieldSchema = z
		.string()
		.min(1, "Date is required")
		.refine((v) => !isNaN(new Date(v).getTime()), "Invalid date")



	const [teamRoles, setTeamRoles] = useState<{
		name: string;
		min: number | "";
		max: number | "";
	}[]>([{
		name:"player",
		min: 1,
		max: 1,
	}])

	function addRole() {
		setTeamRoles((s) => [...s, { name: "", min: "", max: "" }])
	}

	function updateRole(index: number, patch: Partial<{ name: string; min: number | ""; max: number | "" }>) {
		setTeamRoles((s) => s.map((r, i) => (i === index ? { ...r, ...patch } : r)))
	}

	function removeRole(index: number) {
		setTeamRoles((s) => s.filter((_, i) => i !== index))
	}

	return (
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
					onChange: ({ value }: { value: unknown }) => {
						const r = z.string().min(3, "Name must be at least 3 characters").safeParse(value as string)
						return r.success ? undefined : r.error.errors[0]?.message
					}
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
							placeholder="Name of the tournament"
							required
						/>
						{field.state.meta.errors?.[0] && (
							<p className="text-destructive text-sm">{field.state.meta.errors[0]}</p>
						)}
					</div>
				)}
			</form.Field>

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

			<form.Field
				name="description"
			>
				{(field) => (
					<div className="grid gap-2">
						<Label htmlFor={field.name}>Description</Label>
						<Input
							id={field.name}
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							onBlur={field.handleBlur}
							placeholder="Description of the tournament"
							required
						/>
						{field.state.meta.errors?.[0] && (
							<p className="text-destructive text-sm">{field.state.meta.errors[0]}</p>
						)}
					</div>
				)}
			</form.Field>

			<form.Field
				name="max_teams"
				validators={{
					onChange: ({ value }: { value: unknown }) => {
						// value expected to be a number
						const r = z.number().min(3, "Max teams must be at least 3").safeParse(Number(value as any))
						return r.success ? undefined : r.error.errors[0]?.message
					}
				}}
			>
				{(field) => (
					<div className="grid gap-2">
						<Label htmlFor={field.name}>Max Teams</Label>
						<Input
							id={field.name}
							value={field.state.value}
							onChange={(e) => field.handleChange(Number(e.target.value))}
							onBlur={field.handleBlur}
							placeholder="Description of the tournament"
							type="number"
							required
						/>
						{field.state.meta.errors?.[0] && (
							<p className="text-destructive text-sm">{field.state.meta.errors[0]}</p>
						)}
					</div>
				)}
			</form.Field>

			<form.Field
				name="custom_page_component"
			>
				{(field) => (
					<div className="grid gap-2">
						<Label htmlFor={field.name}>Custom Page</Label>
						<Select
							value={field.state.value}
							onValueChange={(value) => field.handleChange(value)}
						>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Select a pages" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Pages</SelectLabel>
									{pages.map((page) => (
										<SelectItem value={page}>{page}</SelectItem>
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

			<div className="grid gap-2">
				<label className="text-sm font-medium">Team structure</label>
				<p className="text-xs text-muted-foreground">Define role names and required min/max counts. Both min and max are mandatory.</p>
				<div className="grid gap-2">
					{teamRoles.map((r, i) => (
						<div key={i} className="flex items-center gap-2">
							<Input placeholder="role name" value={r.name} onChange={(e) => updateRole(i, { name: e.target.value })} />
							{r.name == "player" ? (
								<Input placeholder="nb" type="number" value={r.min === "" ? "" : String(r.min)} onChange={(e) => updateRole(i, { min: e.target.value === "" ? "" : Number(e.target.value), max: e.target.value === "" ? "" : Number(e.target.value) })} className="w-20" />
							) : (
								<>
									<Input placeholder="min" type="number" value={r.min === "" ? "" : String(r.min)} onChange={(e) => updateRole(i, { min: e.target.value === "" ? "" : Number(e.target.value) })} className="w-20" />
									<Input placeholder="max" type="number" value={r.max === "" ? "" : String(r.max)} onChange={(e) => updateRole(i, { max: e.target.value === "" ? "" : Number(e.target.value) })} className="w-20" />
									<Button variant="outline" size="sm" type="button" onClick={() => removeRole(i)}>Remove</Button>
								</>
							)}
						</div>
					))}
				</div>
				<div className="mt-2">
					<Button type="button" size="sm" onClick={addRole}>Add role</Button>
				</div>
			</div>

			<form.Field
				name="registration_start"
				validators={{
					onChange: ({ value }: { value: unknown }) => {
						const r = dateFieldSchema.safeParse(value as string)
						return r.success ? undefined : r.error.errors[0]?.message
					}
				}}
			>
				{(field) => (
					<div className="grid gap-2">
						<Label htmlFor={field.name}>Registration Start date</Label>
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
				name="registration_end"
				validators={{
					onChange: ({ value }: { value: unknown }) => {
						const r = dateFieldSchema.safeParse(value as string)
						if (!r.success) return r.error.errors[0]?.message
						// cross-field check
						const start = new Date(form.state.values.registration_start)
						const end = new Date(value as string)
						if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end <= start) {
							return "Registration end must be after registration start"
						}
						return undefined
					}
				}}
			>
				{(field) => (
					<div className="grid gap-2">
						<Label htmlFor={field.name}>Registration End date</Label>
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
				name="tournament_start"
				validators={{
					onChange: ({ value }: { value: unknown }) => {
						const r = dateFieldSchema.safeParse(value as string)
						if (!r.success) return r.error.errors[0]?.message
						const regEnd = new Date(form.state.values.registration_end)
						const tstart = new Date(value as string)
						if (!isNaN(regEnd.getTime()) && !isNaN(tstart.getTime()) && tstart <= regEnd) {
							return "Tournament start must be after registration end"
						}
						return undefined
					}
				}}
			>
				{(field) => (
					<div className="grid gap-2">
						<Label htmlFor={field.name}>Tournament Start date</Label>
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

			<Button
				type="submit"
				disabled={!form.state.canSubmit || isPending || form.state.isSubmitting}
			>
				{isPending || form.state.isSubmitting ? "Creating..." : "Create Tournament"}
			</Button>
		</form>
	)
}