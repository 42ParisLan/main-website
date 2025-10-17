import type { components } from '@/lib/api/types';

export interface TutorsSlots {
	user: components['schemas']['IntraUser'];
	slots: Record<string, boolean>;
}
