export function toIsoString(localDateTime: string): string {
	const d = new Date(localDateTime);
	if (isNaN(d.getTime())) return '';
	return d.toISOString();
}

export function toDatetimeLocal(iso: string): string {
	const d = new Date(iso);
	if (isNaN(d.getTime())) return '';
	// Adjust to local time and format without seconds/Z
	const tzOffset = d.getTimezoneOffset();
	const local = new Date(d.getTime() - tzOffset * 60000);
	return local.toISOString().slice(0, 16);
}
