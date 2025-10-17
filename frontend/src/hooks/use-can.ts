import { useAuth } from '@/providers/auth.provider';
import { useCallback } from 'react';

export default function useCan() {
	const { permissions } = useAuth();

	return useCallback(
		(path: string, method: string): boolean => {
			const permission = permissions.find((permission) => {
				return wildcardMatch(path, permission.path);
			});
			if (!permission) {
				return false;
			}
			return (
				permission.methods.includes(method) ||
				permission.methods.includes('*')
			);
		},
		[permissions]
	);
}

export function useHasRole() {
	const { me } = useAuth();
	return useCallback(
		(roles: string[]): boolean => {
			return (
				roles.some((role) => me.roles.includes(role)) ||
				me.roles.includes('super-admin')
			);
		},
		[me]
	);
}

function wildcardMatch(path: string, referencePath: string): boolean {
	if (path === referencePath) {
		return true;
	}
	if (referencePath === '*') {
		return true;
	}
	const pathParts = path.split('/');
	const referencePathParts = referencePath.split('/');
	if (pathParts.length < referencePathParts.length) {
		return false;
	}
	for (let i = 0; i < pathParts.length; i++) {
		if (referencePathParts[i] === '*') {
			continue;
		}
		if (pathParts[i] !== referencePathParts[i]) {
			return false;
		}
	}
	return true;
}
