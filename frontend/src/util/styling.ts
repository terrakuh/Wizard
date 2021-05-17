
export function idToBorderColor(id: string) {
	switch (id = id.split("_")[0]) {
		case "red": case "blue": case "green": case "yellow": return id
		default: return "white"
	}
}
