import { SpriteMap } from "use-sound/dist/types"

export const notificationSpriteMap: SpriteMap = {
	"Alarm": [0, 1417],
	"Klang 1": [1417, 757],
	"Klang 2": [2174, 1019]
}
export type AudioTrack = "Alarm" | "Klang 1" | "Klang 2"

export interface Settings {
	notifications: {
		enabled: boolean
		audio: boolean
		audioTrack: AudioTrack
		desktop: boolean
		playerTurn: boolean
	}
	messages: {
		signal: {
			enabled: boolean
			number: string
		}
	}
}
