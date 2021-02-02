export interface Lobby {
	id: string
	playerNames: string[]
	canStart: boolean
}

export interface Score {
	name: string
	points: number
	trick: {
		called: number
		actual: number
	} | null
}

export interface Card {
	id: number
	location: string
	playable: boolean
}

export interface TrickCalling {
	playersLeft: number
	called: number
	round: number
	yourTurn: boolean
}
