import React, { createContext, useContext, useEffect, useState } from "react";

type EnvVars = {
	VITE_OAUTH_AUTHORIZE_URL: string;
	VITE_OAUTH_CLIENT_ID: string;
};

const EnvContext = createContext<EnvVars | undefined>(undefined);

export const EnvProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [env, setEnv] = useState<EnvVars | null>(null);

	useEffect(() => {
		fetch("/api/env")
		.then((res) => res.json())
		.then(setEnv)
		.catch(() => setEnv(null));
	}, []);

	if (!env) return <div>Loading...</div>;

	return <EnvContext.Provider value={env}>{children}</EnvContext.Provider>;
};

export function useEnv() {
	const ctx = useContext(EnvContext);
	if (!ctx) throw new Error("useEnv must be used within EnvProvider");
	return ctx;
}