import type { components } from "@/lib/api/types";
import { useNavigate, useLocation } from "@tanstack/react-router";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useClient } from "./client.provider";
import { errorModelToDescription } from "@/lib/utils";
import LoadingPage from "@/components/loading-page";
import ErrorPage from "@/components/error-page";

type User = components["schemas"]["User"];
type Permission = components["schemas"]["Permission"];

type AuthContextValue = {
	me: User;
	permissions: Permission[];
};

export type AuthContextType = {
	value: AuthContextValue | null;
	setValue: (value: AuthContextValue | null) => void;
	logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextValue {
	const authContext = useContext(AuthContext);
	if (!authContext) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	if (authContext.value === null) {
		throw new Error("AuthContext value is null, user is not authenticated");
	}
	return authContext.value;
}

export function useAuthentificator(): (auth: AuthContextValue) => void {
	const authContext = useContext(AuthContext);
	if (!authContext) {
		throw new Error("useAuthentificator must be used within an AuthProvider");
	}
	return authContext.setValue;
}

export function useLogout(): () => Promise<void> {
	const authContext = useContext(AuthContext);
	if (!authContext) {
		throw new Error("useLogout must be used within an AuthProvider");
	}
	return authContext.logout;
}

export default function AuthProvider({ VITE_OAUTH_AUTHORIZE_URL,
  VITE_OAUTH_CLIENT_ID, children }: { VITE_OAUTH_AUTHORIZE_URL: string,
  VITE_OAUTH_CLIENT_ID: string, children: ReactNode }) {
	const [auth, setAuth] = useState<AuthContextValue | null>(null);
	const location = useLocation();
	const navigate = useNavigate();
	const client = useClient();

	const [error, setError] = useState<string | null>(null);

	const shouldAuth = useMemo(() => isMatchedPathname(location.pathname), [location.pathname]);

	const authorize = useCallback(() => {
		window.location.href = getRedirectUrl(VITE_OAUTH_AUTHORIZE_URL, VITE_OAUTH_CLIENT_ID);
	}, []);

	const logout = useCallback(async () => {
		try {
			await client.GET("/auth/logout");
		} catch (error) {
			console.error("Failed to call logout endpoint:", error);
		} finally {
			setAuth(null);
			window.location.href = '/';
		}
	}, [client]);

	useEffect(() => {
		if (!shouldAuth) return;
		if (auth) return;

		async function fetchAuth() {
			const { data: me, error: meError } = await client.GET("/me");
			if (meError) {
				authorize();
				return;
			}
			const { data: permissions, error: permissionsError } = await client.GET("/me/permissions");
			if (permissionsError) {
				setError(errorModelToDescription(permissionsError));
				return;
			}
			setAuth({
				me,
				permissions,
			});
		}

		fetchAuth();
	}, [auth, authorize, client, location.pathname, navigate, shouldAuth]);

	if (error) {
		return <ErrorPage error={error} />;
	}

	if (shouldAuth && auth == null) {
		return <LoadingPage />;
	}

	return (
		<AuthContext.Provider value={{ value: auth, setValue: setAuth, logout }}>
		{children}
		</AuthContext.Provider>
	);
}

function getAuthorizationUrl(
  redirectUri: string,
  VITE_OAUTH_AUTHORIZE_URL: string,
  VITE_OAUTH_CLIENT_ID: string
): string {
	const url = new URL(VITE_OAUTH_AUTHORIZE_URL || "");
	url.searchParams.append("client_id", VITE_OAUTH_CLIENT_ID || "");
	url.searchParams.append("redirect_uri", redirectUri);
	url.searchParams.append("scope", "public");
	url.searchParams.append("response_type", "code");
	return url.toString();
}

function getRedirectUrl(VITE_OAUTH_AUTHORIZE_URL: string, VITE_OAUTH_CLIENT_ID: string): string {
	const url = window.location.href;
	const callbackUrl = new URL(url);
	const redirect = new URL(url);
	callbackUrl.pathname = "/auth/callback";
	callbackUrl.searchParams.append("redirect", redirect.toString());
	return getAuthorizationUrl(callbackUrl.toString(), VITE_OAUTH_AUTHORIZE_URL, VITE_OAUTH_CLIENT_ID);
}

const matched = ["/admin/(.*)", "/admin", "/register"];

function isMatchedPathname(pathname: string): boolean {
	return matched.some((pattern) => {
		const regex = new RegExp(`^${pattern.replace(/\(.*\)/, ".*")}$`);
		return regex.test(pathname);
	});
}
