import { useState, useEffect } from 'react';

export default function useUrlState<T>(key: string, defaultValue: T) {
	const [value, setValue] = useState<T>(() => {
		const searchParams = new URLSearchParams(window.location.search);
		const value = searchParams.get(key);
		return value ? JSON.parse(value) : defaultValue;
	});

	// The first load useEffect
	// We want to set the value to the default value if the key is not in the URL
	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.search);
		const params = new URLSearchParams(searchParams);
		if (!params.has(key)) {
			setValue(defaultValue);
		}
		// I did not found a way to disable this eslint rule
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const timeout = setTimeout(() => {
			const params = new URLSearchParams(window.location.search);
			if (JSON.stringify(value) === JSON.stringify(defaultValue)) {
				params.delete(key);
			} else {
				params.set(key, JSON.stringify(value));
			}
			window.history.replaceState(null, '', `?${params.toString()}`);
		}, 500);
		return () => clearTimeout(timeout);
	}, [defaultValue, key, value]);
	return [value, setValue] as const;
}
