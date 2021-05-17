
export interface User {
	id: number
	name: string
}

export interface LoginInformation {
	salt: string
	hashType: string
}

export interface Lobby {
	code: string
	mode: number
	players: User[]
	canStart: boolean | null
}

export interface PlayerState {
	player: User
	score: number
	tricksCalled: number | null
	tricksMade: number | null
}

export interface RoundState {
	trumpColor: string | null
	trumpCard: string | null
	round: number
	pastTricks: PlayedCard[][]
}

export interface PlayedCard {
	id: string
	player: User
	isWinning: boolean
}

export interface TrickState {
	playerStates: PlayerState[]
	leadColor: string | null
	leadCard: PlayedCard | null
	round: number | null
	turn: User | null
	deck: PlayedCard[] | null
}

export interface PlayableCard {
	id: string
	playable: boolean
	variants: PlayableCard[] | null
}

export interface RequiredAction {
	type: "call_tricks" | "play_card"
	options: string[]
}

export interface GameInfo {
	hand: PlayableCard[]
	roundState: RoundState
	trickState: TrickState
}
