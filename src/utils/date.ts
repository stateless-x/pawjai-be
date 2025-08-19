export function toIsoDateOrUndefined(year?: string, month?: string, day?: string): string | undefined {
	if (!year || !month || !day) return undefined;
	const y = year.padStart(4, '0');
	const m = month.padStart(2, '0');
	const d = day.padStart(2, '0');
	return `${y}-${m}-${d}`;
} 