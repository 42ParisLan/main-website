import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { components } from './api/types';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getEnv(key: string): string {
	const value = process.env[key];
	if (!value) {
		throw new Error(`Missing environment variable: ${key}`);
	}
	return value;
}

type ErrorModel = components['schemas']['ErrorModel'];

export function errorModelToDescription(error: ErrorModel) {
	return `${error.detail || 'An error occurred'}: ${
		error.errors?.map((error) => error.message).join(', ') || ''
	}`;
}

export function withDelay(fn: () => void, delay: number = 100) {
	setTimeout(fn, delay);
}

export default errorModelToDescription;
