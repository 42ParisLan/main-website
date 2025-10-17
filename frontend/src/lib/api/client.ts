import type { paths } from './types';
import createClient from 'openapi-fetch';

const apiClient = createClient<paths>({
	baseUrl: '/api',
});

export type ApiClient = typeof apiClient;

export default apiClient;
