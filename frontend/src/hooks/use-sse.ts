import { type paths } from '@/lib/api/types.ts';
import { useState, useEffect } from 'react';

// Hook options
type Opts = {
	disabled?: boolean;
};

type HasEventStream<P> = {
	[K in keyof P]: P[K] extends {
		get: {
			responses: {
				200: {
					content: {
						'text/event-stream': any;
					};
				};
			};
		};
	}
		? K
		: never;
}[keyof P];

type EventStreamOf<Ep extends HasEventStream<paths>> = Ep extends keyof paths
	? paths[Ep]['get']['responses'][200]['content']['text/event-stream']
	: never;

// Extract event types and data from the event stream definition
type ExtractEventHandlers<T> =
	T extends Array<infer U>
		? U extends { event?: infer E; data: infer D }
			? E extends string
				? {
						[K in E]: (
							data: D,
							client: EventSource
						) => void | Promise<void>;
					}
				: {
						message: (
							data: D,
							client: EventSource
						) => void | Promise<void>;
					}
			: never
		: T extends { event?: infer E; data: infer D }
			? E extends string
				? {
						[K in E]: (
							data: D,
							client: EventSource
						) => void | Promise<void>;
					}
				: {
						message: (
							data: D,
							client: EventSource
						) => void | Promise<void>;
					}
			: never;

type SseHandlers<Ep extends HasEventStream<paths>> = ExtractEventHandlers<
	EventStreamOf<Ep>
>;

export const useSSE = <Ep extends HasEventStream<paths>>(
	endpoint: Ep,
	handlers: SseHandlers<Ep>,
	opts: Opts = {
		disabled: false,
	}
) => {
	const [error, setError] = useState(false);

	useEffect(() => {
		if (opts.disabled) return undefined;

		const sseClient = new EventSource(`/api${endpoint}`);

		sseClient.onerror = () => setError(true);

		for (const [event, handler] of Object.entries(handlers) as Array<
			[string, (data: any, client: EventSource) => void | Promise<void>]
		>) {
			sseClient.addEventListener(event, (ev) => {
				const data = JSON.parse(ev.data as string);

				const execHandler = async () => await handler(data, sseClient);

				void execHandler();
			});
		}

		return () => sseClient.close();
	}, [endpoint, handlers, opts.disabled]);

	return { error };
};
