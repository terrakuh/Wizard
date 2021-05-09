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
	return null
}
