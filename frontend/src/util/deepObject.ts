export function deepMerge<T extends Object>(base: T, other: any): T {
	const merged = { ...base }
	for (const key in base) {
		if (other[key] !== undefined) {
			merged[key] = typeof base[key] === "object" ? deepMerge(merged[key], other[key]) : other[key]
		}
	}
	return merged
}

export function deepEquals<T>(a: T, b: T) {
	if (typeof a !== "object") {
		return a === b
	}
	for (let key in a) {
		if (!deepEquals(a[key], b[key])) {
			return false
		}
	}
	return true
}
