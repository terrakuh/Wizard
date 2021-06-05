import { SpriteMap } from "use-sound/dist/types"
import { Scheme } from "../theme"

export const notificationSpriteMap: SpriteMap = {
	"Alarm": [0, 1417],
	"Klang 1": [1417, 757],
	"Klang 2": [2174, 1019]
}
export type AudioTrack = "Alarm" | "Klang 1" | "Klang 2"

export interface Settings {
	notifications: {
		audioTrack: AudioTrack | null
	}
	messages: {
		signal: {
			enabled: boolean
			number: string
		}
	}
	theme: Scheme
}
