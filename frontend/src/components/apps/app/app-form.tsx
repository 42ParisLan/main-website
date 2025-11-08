import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type components } from "@/lib/api/types";
import { useCallback, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { z } from "zod";
import { Switch } from "@/components/ui/switch";
import {
	MultiSelector,
	MultiSelectorTrigger,
	MultiSelectorInput,
	MultiSelectorContent,
	MultiSelectorList,
	MultiSelectorItem,
} from "@/components/ui/multi-select";
import { Separator } from "@/components/ui/separator";
import AppRedirectURI from "./app-redirect-uri";
import useQueryClient from "@/hooks/use-query-client";
import { useAuth } from "@/providers/auth.provider";

const formSchema = z.object({
	name: z.string().min(1, "Must not be empty"),
	description: z.string(),
	roles: z.array(z.string()),
	redirect_uris: z.array(z.string().url()),
	implicit_consent: z.boolean(),
});

type AppPayload = components["schemas"]["AppPayload"];

type AppFormProps = {
	appPayload: AppPayload;
	onAppSubmit(data: AppPayload): unknown | Promise<unknown>;
} & React.HTMLAttributes<HTMLFormElement>;

export default function AppForm({
	appPayload,
	onAppSubmit,
	...props
}: AppFormProps) {
	const client = useQueryClient();
	const { data: roles } = client.useQuery("get", "/roles");

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: appPayload,
	});

	const onSubmit = useCallback(() => {
		form.handleSubmit(onAppSubmit)();
	}, [form, onAppSubmit]);

	const {me: user} = useAuth();

	const canImplicitConsent = useMemo(() => user.kind === "admin", [user.kind]);

	return (
		<Form {...form}>
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			className="shrink-0 flex flex-row flex-wrap gap-2 w-fit min-w-72 lg:w-[50rem]"
			{...props}
		>
			<div className="flex flex-col flex-grow">
			<h2 className="text-lg font-semibold">App Information</h2>
			<FormField
				control={form.control}
				name="name"
				render={({ field }) => (
				<FormItem>
					<FormLabel>Name</FormLabel>
					<FormControl>
					<Input placeholder="App Name" {...field} />
					</FormControl>
					<FormMessage />
				</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="description"
				render={({ field }) => (
				<FormItem className="flex flex-col flex-grow mt-2">
					<FormLabel>Description</FormLabel>
					<FormControl>
					<Textarea
						placeholder="A short description of the app"
						className="resize-none w-full flex-grow"
						{...field}
					/>
					</FormControl>
					<FormMessage />
				</FormItem>
				)}
			/>
			</div>
			<Separator
			orientation="vertical"
			className="hidden lg:block h-[80%] mx-2"
			/>
			<div className="flex flex-col flex-grow lg:w-[35%]">
			<h2 className="text-lg font-semibold">App Security</h2>
			<FormField
				control={form.control}
				name="roles"
				render={({ field }) => (
				<FormItem className="-space-y-1">
					<FormLabel>Roles</FormLabel>
					<FormControl>
					<MultiSelector
						values={field.value}
						onValuesChange={field.onChange}
						className="w-full"
					>
						<MultiSelectorTrigger>
						<MultiSelectorInput placeholder="Select Roles" />
						</MultiSelectorTrigger>
						<MultiSelectorContent>
						<MultiSelectorList>
							{roles?.map((role) => (
							<MultiSelectorItem key={role.name} value={role.name}>
								{role.name}
							</MultiSelectorItem>
							))}
						</MultiSelectorList>
						</MultiSelectorContent>
					</MultiSelector>
					</FormControl>
					<FormMessage />
				</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="implicit_consent"
				render={({ field }) => (
				<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm my-2 bg-background">
					<div className="space-y-0.5">
					<FormLabel>Implicit Consent</FormLabel>
					<FormDescription>
						If enabled, users will not be prompted to authorize the app
						when logging in.
					</FormDescription>
					</div>
					<FormControl>
					<Switch
						checked={field.value}
						onCheckedChange={field.onChange}
						disabled={!canImplicitConsent}
					/>
					</FormControl>
				</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="redirect_uris"
				render={({ field }) => (
				<FormItem>
					<FormLabel>Redirect URIs</FormLabel>
					<FormControl>
					<AppRedirectURI
						values={field.value}
						onValuesChange={field.onChange}
					/>
					</FormControl>
					<FormMessage />
				</FormItem>
				)}
			/>
			</div>
			<div className="flex justify-end w-full mt-4">
			<Button type="submit">Submit</Button>
			</div>
		</form>
		</Form>
	);
}
