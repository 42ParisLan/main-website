import useQueryClient from "@/hooks/use-query-client";
import errorModelToDescription from "@/lib/utils";
import { useRouter } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import type { components } from "@/lib/api/types";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../ui/select";
import {useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../ui/button";
import { toDatetimeLocal, toIsoString } from "@/lib/date.utils";

type Props = {
  tournament: components["schemas"]["Tournament"];
};

export default function TournamentEdit({ tournament }: Props) {
	const router = useRouter();
	const client = useQueryClient();

	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>(tournament.iamge_url ?? "");
	const [externalLinks, setExternalLinks] = useState<Array<{ key: string; url: string }>>(() => {
		const links = tournament.external_links ?? {};
		return Object.keys(links).map((k) => ({ key: k, url: links[k] }));
	});

	function addExternalLink() {
		setExternalLinks((s) => [...s, { key: '', url: '' }]);
	}

	function updateExternalLink(index: number, patch: Partial<{ key: string; url: string }>) {
		setExternalLinks((s) => s.map((l, i) => (i === index ? { ...l, ...patch } : l)));
	}

	function removeExternalLink(index: number) {
		setExternalLinks((s) => s.filter((_, i) => i !== index));
	}

	useEffect(() => {
		if (!selectedFile) {
			setPreviewUrl(tournament.iamge_url ?? "");
			return;
		}
		const url = URL.createObjectURL(selectedFile);
		setPreviewUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [selectedFile, tournament.iamge_url]);

	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const { mutate, isPending } = client.useMutation("patch", "/tournaments/{id}", {
		onSuccess(data) {
			toast.success("Tournament updated")
			router.navigate({ to: `/admin/tournaments/${data.slug}` });
		},
		onError(error) {
			console.error(`Error while updating Tournament ${error}`)
			const errorMessage = errorModelToDescription(error);
			toast.error(`Error while updating Tournament: ${errorMessage}`)
		}
	})

	const initialRef = useRef(tournament);

	const form = useForm({
		defaultValues: {
			custom_page_component: tournament.custom_page_component,
			description: tournament.description,
			max_teams: tournament.max_teams,
			registration_end: tournament.registration_end,
			registration_start: tournament.registration_start,
			tournament_start: tournament.tournament_start,
			image: null as File | null,
			is_visible: tournament.is_visible,
		},
		onSubmit: async ({ value }) => {
			const old = initialRef.current;
			const formData = new FormData();

			if ((old.custom_page_component ?? "") !== (value.custom_page_component ?? "")) {
				if (value.custom_page_component) formData.append('custom_page_component', String(value.custom_page_component));
				else formData.append('custom_page_component', '');
			}

			if ((old.description ?? "") !== (value.description ?? "")) {
				formData.append('description', String(value.description ?? ''));
			}

			if ((old.max_teams ?? 0) !== (value.max_teams ?? 0)) {
				formData.append('max_teams', String(value.max_teams ?? 0));
			}

			if ((old.registration_end ?? "") !== (value.registration_end ?? "")) {
				formData.append('registration_end', String(value.registration_end ?? ''));
			}

			if ((old.registration_start ?? "") !== (value.registration_start ?? "")) {
				formData.append('registration_start', String(value.registration_start ?? ''));
			}

			if ((old.tournament_start ?? "") !== (value.tournament_start ?? "")) {
				formData.append('tournament_start', String(value.tournament_start ?? ''));
			}

			if (value.image) {
				formData.append('image', value.image);
			}

			const linksObj: { [k: string]: string } = {};
			for (const l of externalLinks) {
				const key = (l.key ?? '').trim();
				const url = (l.url ?? '').trim();
				if (key && url) linksObj[key] = url;
			}

			const oldLinks = old.external_links ?? {};
			const newLinksJson = JSON.stringify(linksObj);
			const oldLinksJson = JSON.stringify(oldLinks);
			if (newLinksJson !== oldLinksJson) {
				formData.append('external_links', newLinksJson);
			}

			if (formData.keys().next().done) {
				toast.info('No changes to save');
				return;
			}

			mutate({ params: { path: { id: old.id } }, body: formData as any });
		}
	})

	const modules = import.meta.glob('../custom-pages/*.tsx', { eager: true })

	const pages = useMemo(() => {
		return Object.keys(modules).map((p) => p.split('/').pop()?.replace('.tsx', '') || p)
	}, [modules])

	return (
		<>
			<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="grid gap-4 py-2"
			>

				<form.Field name="image">
					{(field) => (
					<div className="grid gap-2">
						<Label htmlFor="component-image">Image</Label>
						<div className="flex items-center gap-3">
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

						<Button type="button" className="inline-flex" onClick={() => fileInputRef.current?.click()}>
							Upload image
						</Button>

						{field.state.value && (
							<Button type="button" variant="ghost" onClick={() => { field.handleChange(null); setSelectedFile(null); }}>
							Remove
							</Button>
						)}
						</div>

						<div className="w-full max-w-xs aspect-square rounded-xl overflow-hidden shadow-lg bg-muted/10 flex items-center justify-center">
						{previewUrl ? (
							<img className="w-full h-full object-cover" src={previewUrl} alt="tournament preview" />
						) : (
							<div className="text-center p-4 text-sm text-muted-foreground">No image</div>
						)}
						</div>
					</div>
					)}
				</form.Field>

				<form.Field name="description">
					{(field) => (
					<div className="grid gap-2">
						<Label htmlFor={field.name}>Description</Label>
						<Input id={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} placeholder="Description" />
					</div>
					)}
				</form.Field>

				<form.Field name="max_teams">
					{(field) => (
					<div className="grid gap-2">
						<Label htmlFor={field.name}>Max Teams</Label>
						<Input id={field.name} value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} onBlur={field.handleBlur} type="number" />
					</div>
					)}
				</form.Field>

				<form.Field name="custom_page_component">
					{(field) => (
					<div className="grid gap-2">
						<Label htmlFor={field.name}>Custom Page</Label>
						<Select value={field.state.value} onValueChange={(value) => field.handleChange(value)}>
						<SelectTrigger className="w-[180px]"><SelectValue placeholder="Select a page" /></SelectTrigger>
						<SelectContent>
							<SelectGroup>
							<SelectLabel>Pages</SelectLabel>
							{pages.map((page) => (
								<SelectItem key={page} value={page}>{page}</SelectItem>
							))}
							</SelectGroup>
						</SelectContent>
						</Select>
					</div>
					)}
				</form.Field>

					<div className="grid gap-2">
						<label className="text-sm font-medium">External Links</label>
						<p className="text-xs text-muted-foreground">Add label + URL pairs (e.g. Instagram → https://...)</p>
						<div className="grid gap-2">
							{externalLinks.map((l, i) => (
								<div key={i} className="flex items-center gap-2">
									<Input placeholder="Label (e.g. Instagram)" value={l.key} onChange={(e) => updateExternalLink(i, { key: e.target.value })} />
									<Input placeholder="https://..." value={l.url} onChange={(e) => updateExternalLink(i, { url: e.target.value })} />
									<Button type="button" variant="ghost" size="sm" onClick={() => removeExternalLink(i)}>Remove</Button>
								</div>
							))}
							<div className="mt-2">
								<Button type="button" size="sm" onClick={addExternalLink}>Add link</Button>
							</div>
						</div>
					</div>

				<form.Field name="registration_start">
					{(field) => (
					<div className="grid gap-2">
						<Label htmlFor={field.name}>Registration Start date</Label>
						<Input id={field.name} type="datetime-local" value={toDatetimeLocal(field.state.value)} onChange={(e) => field.handleChange(toIsoString(e.target.value))} onBlur={field.handleBlur} />
					</div>
					)}
				</form.Field>

				<form.Field name="registration_end">
					{(field) => (
					<div className="grid gap-2">
						<Label htmlFor={field.name}>Registration End date</Label>
						<Input id={field.name} type="datetime-local" value={toDatetimeLocal(field.state.value)} onChange={(e) => field.handleChange(toIsoString(e.target.value))} onBlur={field.handleBlur} />
					</div>
					)}
				</form.Field>

				<form.Field name="tournament_start">
					{(field) => (
					<div className="grid gap-2">
						<Label htmlFor={field.name}>Tournament Start date</Label>
						<Input id={field.name} type="datetime-local" value={toDatetimeLocal(field.state.value)} onChange={(e) => field.handleChange(toIsoString(e.target.value))} onBlur={field.handleBlur} />
					</div>
					)}
				</form.Field>

				<form.Field name="is_visible">
					{(field) => (
						<div className="grid gap-2">
							<div className="flex items-center gap-3">
								<input
									type="checkbox"
									id={field.name}
									checked={Boolean(field.state.value)}
									onChange={(e) => field.handleChange(Boolean(e.target.checked))}
									onBlur={field.handleBlur}
									className="w-4 h-4"
								/>
								<label htmlFor={field.name} className="text-sm font-medium">Visible</label>
							</div>
							<p className="text-xs text-muted-foreground">Toggle whether the tournament is publicly visible.</p>
						</div>
					)}
				</form.Field>

				<div className="flex items-center justify-end">
					<Button type="submit" disabled={isPending || form.state.isSubmitting}>{isPending || form.state.isSubmitting ? 'Updating...' : 'Update Tournament'}</Button>
				</div>
			</form>
		</>
	)
}
