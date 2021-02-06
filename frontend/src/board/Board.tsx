import React from "react"
import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core"
import ScoreBoard from "../score/ScoreBoard"
import { Card, Score, TrickCalling } from "../types"
import { Loading } from "../util"
import Deck from "./Deck"
import Hand from "./Hand"
import { gql, useQuery } from "@apollo/client"
import { RouteComponentProps, withRouter } from "react-router-dom"
import TrickCallDialog from "./TrickCallDialog"
import { withSnackbar, WithSnackbarProps } from "notistack"
import useSound from "use-sound"
import { useSettings } from "../settings"

interface Props extends WithStyles<typeof styles>, RouteComponentProps, WithSnackbarProps { }

function Board(props: Props) {
	const { settings } = useSettings()
	const { data: gameInfo } = useQuery<GameInfo>(GAME_INFO, { pollInterval: 1000 })
	const [playTurnSound] = useSound("/your_turn_0.mp3")

	React.useEffect(() => {
		if (settings.notifications.enabled) {
			if (gameInfo?.playerTurn === localStorage.getItem("name")) {
				if (settings.notifications.desktop) {
					Notification.requestPermission()
						.then(() => {
							new Notification("Wizard", {
								body: "Du bist am Zug.",
								silent: !settings.notifications.audio
							})
						})
				} else {
					props.enqueueSnackbar("Your turn.", {
						autoHideDuration: null,
						variant: "info",
						key: "player-turn"
					})
					if (settings.notifications.audio) {
						playTurnSound()
					}
				}
			} else if (!settings.notifications.desktop) {
				props.closeSnackbar("player-turn")
			}
		}
	}, [gameInfo?.playerTurn, props, playTurnSound, settings])

	if (gameInfo?.gameInProgress === false) {
		props.history.push("/")
		return <></>
	} else if (gameInfo === undefined || gameInfo.scores === null || gameInfo.hand === null) {
		return <Loading open={true} />
	}

	return (
		<div className={props.classes.root}>
			<TrickCallDialog
				clearContext={() => { }}
				context={gameInfo?.trickCallRequired ?? undefined} />

			<ScoreBoard
				className={props.classes.scoreBoard}
				turn={gameInfo.playerTurn}
				scores={gameInfo.scores} />
			<Deck
				deckColor={gameInfo.deckColor}
				deck={gameInfo.deck}
				trickColor={gameInfo.trickColor} />
			<Hand hand={gameInfo.hand} />
		</div>
	)
}

const styles = (theme: Theme) => createStyles({
	root: {
		position: "relative",
		display: "flex",
		flexDirection: "column",
		gap: theme.spacing()
	},
	scoreBoard: {
		position: "absolute",
		right: 0,
		top: 0
	}
})

interface GameInfo {
	scores: Score[] | null
	playerTurn: string | null
	trickColor: string | null
	deck: string[] | null
	deckColor: string | null
	gameInProgress: boolean
	trickCallRequired: TrickCalling | null
	hand: Card[] | null
}

const GAME_INFO = gql`
	query {
		scores {
			name
			points
			trick {
				actual
				called
			}
		}
		playerTurn
		trickColor
		deck
		deckColor
		gameInProgress
		trickCallRequired {
			playersLeft
			called
			round
			yourTurn
		}
		hand {
			id
			location
			playable
		}
	}
`

export default withStyles(styles)(withRouter(withSnackbar(Board)))
