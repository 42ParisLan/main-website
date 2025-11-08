"use client";

import CopyInput from "@/components/copy-input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { type components } from "@/lib/api/types";
import { useMemo, useState } from "react";
import AppActions from "./app-actions";
import { IconStack, IconLink } from '@tabler/icons-react';
import useCan from "@/hooks/use-can";
import { BadgeCheckIcon, LockIcon } from "lucide-react";
import { useAuth } from "@/providers/auth.provider";

type App = components["schemas"]["App"];

type AppDisplayProps = {
	initialAppData: App;
};

export default function AppDisplay({ initialAppData }: AppDisplayProps) {
	const [app, setApp] = useState<App>(initialAppData);

	const {me: user} = useAuth();
	const can = useCan();

	const isSudo = useMemo(() => can("/apps", "SUDO"), [can]);
	const isOwner = useMemo(
		() => isSudo || app.owner.id === user.id,
		[app.owner.id, isSudo, user.id],
	);

	const openIDURLs = useMemo(() => {
		// we check if window is defined because this code runs on the server
		if (typeof window === "undefined") {
		return {
			openid_issuer: "...",
			openid_discovery: "...",
			oauth_token: "...",
			oauth_introspect: "...",
			oauth_authorize: "...",
			oauth_userinfo: "...",
			oauth_revoke: "...",
		};
		}
		const baseURL = new URL(window.location.href);
		return {
		openid_issuer: `${baseURL.origin}/api/openid`,
		openid_discovery: `${baseURL.origin}/api/openid/.well-known/openid-configuration`,
		oauth_token: `${baseURL.origin}/api/openid/oauth/token`,
		oauth_introspect: `${baseURL.origin}/api/openid/oauth/introspect`,
		oauth_authorize: `${baseURL.origin}/api/openid/authorize`,
		oauth_userinfo: `${baseURL.origin}/api/openid/userinfo`,
		oauth_revoke: `${baseURL.origin}/api/openid/revoke`,
		};
	}, []);

	return (
		<>
			<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
				<Card className="@container/card">
					<CardHeader className="flex justify-between">
						<div className="flex flex-col">
							<div className="flex items-center mb-2">
								<CardTitle className="text-3xl font-semibold">
									{app.name}
								</CardTitle>
								{app.owner.kind === "admin" && (
									<BadgeCheckIcon className="w-6 h-6 text-purple-500 ml-2" />
								)}
							</div>
							<a
								href={`/dash/users/${app.owner.username}`}
								className="text-gray-500"
							>
								Owned By{" "}
								<span className="underline cursor-pointer">{app.owner.username}</span>
							</a>
						</div>
						{isOwner && <AppActions app={app} setApp={setApp} />}
					</CardHeader>
					<CardContent>
						<h2 className="text-xl font-semibold mt-4">Description</h2>
						<p className="mt-2 text-gray-500">{app.description}</p>
						<h2 className="text-xl font-semibold mt-4">Auth Information</h2>
						<div className="flex flex-wrap gap-4 flex-grow mt-2">
							<div className="flex flex-col flex-wrap gap-4 flex-grow">
							<Card className="flex-grow">
								<CardHeader className="pb-2">
								<CardTitle>
									<LockIcon className="w-6 h-6 inline-block -mt-1 mr-2" />
									Credentials
								</CardTitle>
								<p className="text-gray-500">
									You can use these credentials to authenticate this app using{" "}
									<strong>OIDC</strong> or <strong>OAuth</strong>.
								</p>
								</CardHeader>
								<CardContent className="space-y-2">
								<div>
									<p className="text-gray-500">ID</p>
									<CopyInput value={app.id} />
									<p className="text-gray-500">Secret</p>
									<CopyInput value={app.secret} />
								</div>
								</CardContent>
							</Card>
							<Card className="flex-grow">
								<CardHeader className="pb-2">
								<CardTitle>
									<IconStack className="w-6 h-6 inline-block -mt-1 mr-2" />
									Roles
								</CardTitle>
								<p className="text-gray-500">
									These are the roles that this app has access to.
								</p>
								</CardHeader>
								<CardContent className="flex flex-wrap gap-1">
								{app.roles.map((role, i) => (
									<div
									key={i}
									className="w-fit p-2 rounded-md bg-background border"
									>
									{role}
									</div>
								))}
								</CardContent>
							</Card>
							<Card className="flex-grow">
								<CardHeader className="pb-2">
								<CardTitle>
									<IconLink className="w-6 h-6 inline-block -mt-1 mr-2" />
									Redirect URIs
								</CardTitle>
								<p className="text-gray-500">
									You can use these URIs to redirect the user after they have
									authenticated.
								</p>
								</CardHeader>
								<CardContent className="space-y-2">
								{app.redirect_uris.map((uri, i) => (
									<CopyInput
									key={i}
									value={uri}
									className="text-gray-500 text-pretty"
									/>
								))}
								</CardContent>
							</Card>
							</div>
							<Card className="flex-grow">
								<CardHeader className="pb-2">
								<CardTitle>
								<IconLink className="w-6 h-6 inline-block -mt-1 mr-2" />
								OpenID Connect URLs
								</CardTitle>
								<p className="text-gray-500">
								You can use these URLs to authenticate users using{" "}
								<strong>OIDC</strong> or <strong>OAuth</strong>.
								</p>
							</CardHeader>
							<CardContent className="space-y-2">
								<div>
								<p className="text-gray-500">Issuer</p>
								<CopyInput value={openIDURLs.openid_issuer} />
								<p className="text-gray-500">Discovery</p>
								<CopyInput value={openIDURLs.openid_discovery} />
								<p className="text-gray-500">Authorize</p>
								<CopyInput value={openIDURLs.oauth_authorize} />
								<p className="text-gray-500">Token</p>
								<CopyInput value={openIDURLs.oauth_token} />
								<p className="text-gray-500">Userinfo</p>
								<CopyInput value={openIDURLs.oauth_userinfo} />
								<p className="text-gray-500">Introspect</p>
								<CopyInput value={openIDURLs.oauth_introspect} />
								<p className="text-gray-500">Revoke</p>
								<CopyInput value={openIDURLs.oauth_revoke} />
								</div>
							</CardContent>
							</Card>
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	);
}
