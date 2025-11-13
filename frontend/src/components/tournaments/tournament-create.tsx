import useQueryClient from "@/hooks/use-query-client";
import errorModelToDescription from "@/lib/utils";
import { useRouter } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import type { components } from "@/lib/api/types";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { toDatetimeLocal, toIsoString } from "@/lib/date.utils";

export default function TournamentCreate() {
	const router = useRouter();
	const client = useQueryClient();

	const {mutate} = client.useMutation("post", "/tournaments", {
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
			external_link: undefined as string | undefined,
			max_teams: 0,
			name: "",
			registration_end: "",
			registration_start: "",
			tournament_end: "",
			tournament_start: "",
		},
		onSubmit: async ({ value }) => {
			let team_structure: Record<string, { min: number; max: number }> = {}
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

			const body: components["schemas"]["CreateTournament"] = {
				custom_page_component: value.custom_page_component,
				description: value.description,
				external_link: value.external_link,
				max_teams: value.max_teams,
				name: value.name,
				registration_end: value.registration_end,
				registration_start: value.registration_start,
				slug: value.name.toLocaleLowerCase().replaceAll(" ", "-"),
				team_structure,
				tournament_end: value.tournament_end,
				tournament_start: value.tournament_start,
			};
			mutate({ body });
		},
	});

	const modules = import.meta.glob('./custom-pages/*.tsx', { eager: true })

	const pages = useMemo(() => {
		return Object.keys(modules).map((p) => p.split('/').pop()?.replace('.tsx', '') || p)
	}, [modules])


	const [teamRoles, setTeamRoles] = useState<{
		name: string;
		min: number | "";
		max: number | "";
	}[]>([])

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
							<Input placeholder="min" type="number" value={r.min === "" ? "" : String(r.min)} onChange={(e) => updateRole(i, { min: e.target.value === "" ? "" : Number(e.target.value) })} className="w-20" />
							<Input placeholder="max" type="number" value={r.max === "" ? "" : String(r.max)} onChange={(e) => updateRole(i, { max: e.target.value === "" ? "" : Number(e.target.value) })} className="w-20" />
							<Button variant="outline" size="sm" type="button" onClick={() => removeRole(i)}>Remove</Button>
						</div>
					))}
				</div>
				<div className="mt-2">
					<Button type="button" size="sm" onClick={addRole}>Add role</Button>
				</div>
			</div>

			<form.Field
				name="registration_start"
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

			<form.Field
				name="tournament_end"
			>
				{(field) => (
					<div className="grid gap-2">
						<Label htmlFor={field.name}>Tournament End date</Label>
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
		</form>
	)
}