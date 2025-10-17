import { useEffect, useRef, useState } from 'react';

// This hook is useful when you want to delay the state update of a component.
// It is useful when you want to avoid updating the state on every key press
// for example in a search input.
export default function useDelayedState<T>(state: T, delay = 500) {
	const [value, setValue] = useState(state);
	const currentTimeout = useRef<NodeJS.Timeout | null>(null);
	const initialRender = useRef(true);

	useEffect(() => {
		if (initialRender.current) {
			initialRender.current = false;
			return;
		}
		if (currentTimeout.current) {
			clearTimeout(currentTimeout.current);
		}

		currentTimeout.current = setTimeout(() => {
			setValue(state);
		}, delay);

		return () => {
			if (currentTimeout.current) {
				clearTimeout(currentTimeout.current);
			}
		};
	}, [state, delay]);

	return value;
}
