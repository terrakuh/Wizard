// import React from "react"
// import { createStyles, makeStyles, Theme, withStyles, WithStyles } from "@material-ui/core"
// import ScoreBoard from "../score/ScoreBoard"
// import { Card, Score, TrickCalling } from "../types"
// import { Loading } from "../util"
// import Deck from "./Deck"
// import Hand from "./Hand"
// import { gql, useQuery } from "@apollo/client"
// import { Redirect, RouteComponentProps, useHistory, withRouter } from "react-router-dom"
// import TrickCallDialog from "./TrickCallDialog"
// import { useSnackbar, withSnackbar, WithSnackbarProps } from "notistack"
// import { useSettings } from "../settings"
// import useTurnSound from "./useTurnSound"

import { useQuery } from "@apollo/client"
import { makeStyles } from "@material-ui/core"
import gql from "graphql-tag"
import { useDrag } from "react-dnd"
import { PlayableCard, RequiredAction, TrickState, RoundState } from "../types"
import { Loading } from "../util"
import Action from "./actions"
import Deck from "./Deck"
import Hand from "./Hand"

// export default function Game() {
// 	const classes = useStyles()
// 	const history = useHistory()
// 	const {enqueueSnackbar} = useSnackbar()
// 	const { settings, setSettings } = useSettings()
// 	const { data: gameInfo } = useQuery<GameInfo>(GAME_INFO, { pollInterval: 1000 })

// 	useTurnSound({
// 		settings,
// 		setSettings,
// 		playerTurn: gameInfo?.playerTurn
// 	})

// 	if (gameInfo?.gameInProgress === false) {
// 		return <Redirect to="/" />
// 	} else if (gameInfo === undefined || gameInfo.scores === null || gameInfo.hand === null) {
// 		return <Loading loading={true} />
// 	}

// 	return (
// 		<div className={classes.root}>
// 			<TrickCallDialog
// 				clearContext={() => { }}
// 				context={gameInfo?.trickCallRequired ?? undefined} />

// 			<ScoreBoard
// 				className={classes.scoreBoard}
// 				turn={gameInfo.playerTurn}
// 				scores={gameInfo.scores} />
// 			<Deck
// 				deckColor={gameInfo.deckColor}
// 				deck={gameInfo.deck}
// 				trickColor={gameInfo.trickColor} />
// 			<Hand hand={gameInfo.hand} />
// 		</div>
// 	)
// }

// const useStyles = makeStyles((theme: Theme) => ({
// 	root: {
// 		position: "relative",
// 		display: "flex",
// 		flexDirection: "column",
// 		gap: theme.spacing()
// 	},
// 	scoreBoard: {
// 		position: "absolute",
// 		right: 0,
// 		top: 0
// 	}
// }))

// interface GameInfo {
// 	scores: Score[] | null
// 	playerTurn: string | null
// 	trickColor: string | null
// 	deck: string[] | null
// 	deckColor: string | null
// 	gameInProgress: boolean
// 	trickCallRequired: TrickCalling | null
// 	hand: Card[] | null
// }

// const GAME_INFO = gql`
// 	query {
// 		hand {
// 			id
// 			playable
// 			variants {
// 				id
// 				playable
// 			}
// 		}
// 		roundState {
// 			round
// 			trumpColor
// 		}
// 	}
// `
export default function Game() {
	const classes = useStyles()
	const { data } = useQuery<Info>(GET_INFO, { pollInterval: 1000 })

	return (
		<div className={classes.root}>
			<Deck />

			<Hand cards={data?.hand ?? []} />

			<Action
				info={data?.requiredAction != null && data.roundState != null && data.trickState != null ? {
					requiredAction: data.requiredAction,
					roundState: data.roundState,
					trickState: data.trickState
				} : null} />
		</div>
	)
}

const useStyles = makeStyles({
	root: {
		display: "flex",
		flexDirection: "column",
		height: "100%",
		width: "100%"
	}
})

interface Info {
	hand: PlayableCard[] | null
	requiredAction: RequiredAction | null
	trickState: TrickState | null
	roundState: RoundState | null
}

const GET_INFO = gql`
	query {
		hand {
			id
			playable
			variants {
				id
				playable
			}
		}
		requiredAction {
			type
			options
		}
		trickState {
			playerStates {
				player {
					id
					name
				}
			score
			tricksCalled
			tricksMade
			}
			leadColor
			round
			turn {
				id
				name
			}
			deck {
				id
				player {
					id
					name
				}
				isWinning
			}
		}
		roundState {
			trumpColor
			round
		}
	}
`
