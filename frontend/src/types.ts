
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
	mode: string
	maxRounds: number
	roundLimit: number
	players: User[]
	canStart: boolean | null
}

export interface PlayerState {
	player: User
	score: number
	isActive: boolean
	tricksCalled: number | null
	tricksMade: number | null
}

export interface RoundState {
	trumpColor: string | null
	trumpCard: string | null
	round: number
	pastTrick: TrickState | null
}

export interface PlayedCard {
	id: string
	player: User
	isWinning: boolean
}

export interface TrickState {
	leadColor: string | null
	leadCard: PlayedCard | null
	round: number | null
	deck: PlayedCard[] | null
}

export interface PlayableCard {
	id: string
	playable: boolean
}

export interface RequiredAction {
	type: "call_tricks" | "play_card"
	options: string[]
}

export interface GameInfo {
	hand: PlayableCard[]
	roundState: RoundState
	trickState: TrickState | null
	playerStates: PlayerState[]
}

export interface Appointment {
	id: number
	start: string
	end: string
	participants: User[]
}
