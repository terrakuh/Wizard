
export interface User {
	id: number
	name: string
}

export interface LoginInformation {
	salt: string
	hashType: string
}

export interface Lobby {
	mode: number
	players: User[]
}

export interface PlayerState {
	player: User
	score: number
	tricksCalled: number | null
	tricksMade: number | null
}

export interface RoundState {
	trumpColor: number | null
	round: number
}

export interface PlayedCard {
	id: number
	player: User
	isWinning: boolean
}

export interface TrickState {
	playerStates: PlayerState[]
	leadColor: number | null
	round: number | null
	turn: User | null
	deck: PlayedCard[] | null
}

export interface PlayableCard {
	id: number
	playable: boolean
	variants: PlayableCard[] | null
}

export interface RequiredAction {
	type: string
	options: string[]
}
