import { QueryClientContext } from '../providers/query-client.provider';
import { useContext } from 'react';

export default function useQueryClient() {
	const queryClient = useContext(QueryClientContext);
	if (!queryClient) {
		throw new Error(
			'useQueryClient must be used within a QueryClientProvider'
		);
	}

	return queryClient;
}
