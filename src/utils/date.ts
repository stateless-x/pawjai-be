export function toIsoDateOrUndefined(year?: string, month?: string, day?: string): string | undefined {
	if (!year || !month || !day) return undefined;
	
	// Validate that the values are numeric
	const yearNum = parseInt(year);
	const monthNum = parseInt(month);
	const dayNum = parseInt(day);
	
	if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum)) {
		console.warn('[DateUtils] Invalid date values:', { year, month, day });
		return undefined;
	}
	
	// Validate date ranges
	if (yearNum < 1900 || yearNum > 2100) {
		console.warn('[DateUtils] Year out of valid range:', yearNum);
		return undefined;
	}
	
	if (monthNum < 1 || monthNum > 12) {
		console.warn('[DateUtils] Month out of valid range:', monthNum);
		return undefined;
	}
	
	if (dayNum < 1 || dayNum > 31) {
		console.warn('[DateUtils] Day out of valid range:', dayNum);
		return undefined;
	}
	
	const y = year.padStart(4, '0');
	const m = month.padStart(2, '0');
	const d = day.padStart(2, '0');
	
	// Validate that the date is actually valid
	const dateString = `${y}-${m}-${d}`;
	const date = new Date(dateString);
	
	if (isNaN(date.getTime())) {
		console.warn('[DateUtils] Invalid date combination:', dateString);
		return undefined;
	}
	
	return dateString;
} 