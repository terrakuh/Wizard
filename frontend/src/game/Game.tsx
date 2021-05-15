import { useQuery } from "@apollo/client"
import { makeStyles } from "@material-ui/core"
import gql from "graphql-tag"
import { useMemo } from "react"
import { useDrop } from "react-dnd"
import { Redirect } from "react-router"
import { RequiredAction, GameInfo } from "../types"
import { Loading } from "../util"
import Action from "./actions"
import Deck from "./Deck"
import Hand from "./Hand"
import ScoreBoard from "./ScoreBoard"

export default function Game() {
	const classes = useStyles()
	const { data } = useQuery<Info>(GET_INFO, { pollInterval: 1000 })
	const [, drop] = useDrop({ accept: "card" })

	// prevents redraws
	const actionInfo = useMemo(() => {
		if (data?.gameInfo == null || data.requiredAction == null) {
			return null
		}
		return {
			...data.gameInfo,
			requiredAction: data.requiredAction
		}
	}, [data])

	if (data == null) {
		return <Loading loading={true} />
	} else if (data.gameInfo == null) {
		return <Redirect to="/lobby" />
	}

	const { gameInfo: { hand, trickState } } = data

	return (
		<div className={classes.root}>
			<div className={classes.dropArea} ref={drop}>
				<Deck cards={trickState.deck ?? []} />
			</div>

			<ScoreBoard
				className={classes.scoreBoard}
				trickState={trickState} />

			<Hand cards={hand ?? []} />

			<Action info={actionInfo} />
		</div>
	)
}

const useStyles = makeStyles({
	root: {
		display: "flex",
		flexDirection: "column",
		height: "100%",
		width: "100%"
	},
	scoreBoard: {
		position: "absolute",
		right: 0
	},
	dropArea: {
		flexGrow: 1
	}
})

interface Info {
	gameInfo: GameInfo | null
	requiredAction: RequiredAction | null
}

const GET_INFO = gql`
	query {
		gameInfo {
			hand {
				id
				playable
				variants {
					id
					playable
				}
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
		requiredAction {
			type
			options
		}
	}
`
