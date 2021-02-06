export default function deepMerge<T extends Object>(base: T, other: any): T {
	const merged = { ...base }
	for (const key in base) {
		if (other[key] !== undefined) {
			merged[key] = typeof base[key] === "object" ? deepMerge(merged[key], other[key]) : other[key]
		}
	}
	return merged
}

// export function mergeDeep(target, ...sources) {
//   if (!sources.length) return target;
//   const source = sources.shift();

//   if (isObject(target) && isObject(source)) {
//     for (const key in source) {
//       if (isObject(source[key])) {
//         if (!target[key]) Object.assign(target, { [key]: {} });
//         mergeDeep(target[key], source[key]);
//       } else {
//         Object.assign(target, { [key]: source[key] });
//       }
//     }
//   }

//   return mergeDeep(target, ...sources);
// }
