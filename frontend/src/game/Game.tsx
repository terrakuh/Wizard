import { useQuery } from "@apollo/client"
import { makeStyles } from "@material-ui/core"
import gql from "graphql-tag"
import { useMemo, useState } from "react"
import { useDrop } from "react-dnd"
import { Redirect } from "react-router"
import { RequiredAction, GameInfo } from "../types"
import { Loading } from "../util"
import Action from "./actions"
import Deck from "./Deck"
import Hand from "./Hand"
import ScoreBoard from "./ScoreBoard"
import TrumpCard from "./card/TrumpCard"
import PastTrick from "./PastTrick"
import usePlayCard from "./card/usePlayCard"

export default function Game() {
	const classes = useStyles()
	const { data } = useQuery<Info>(GET_INFO, { pollInterval: 1000 })
	const playCard = usePlayCard()
	const [, drop] = useDrop({
		accept: "card",
		drop(item: any) {
			playCard(item.id)
		}
	})
	const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null)

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

	const { gameInfo: { hand, trickState, roundState } } = data

	console.log("New player state:\n" + JSON.stringify(trickState.playerStates))

	return (
		<div className={classes.root} ref={setRootRef}>
			<div className={classes.dropArea} ref={drop}>
				<Deck cards={trickState.deck ?? []} />

				<TrumpCard
					trumpCard={roundState.trumpCard}
					trumpColor={roundState.trumpColor}
					leadCard={trickState.leadCard?.id ?? null}
					leadColor={trickState.leadColor}
					className={classes.trumpCard} />
			</div>

			<PastTrick
				boundary={rootRef}
				className={classes.pastTrick}
				pastTrick={roundState.pastTrick} />

			<ScoreBoard
				roundState={roundState}
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
		width: "100%",
		position: "relative"
	},
	scoreBoard: {
		position: "absolute",
		right: 0
	},
	dropArea: {
		flexGrow: 1,
		position: "relative"
	},
	trumpCard: {
		position: "absolute",
		top: "50%",
		transform: "translateY(-50%)"
	},
	pastTrick: {
		position: "absolute",
		left: 0,
		top: 0
	}
})

interface Info {
	gameInfo: GameInfo | null
	requiredAction: RequiredAction | null
}

const GET_INFO = gql`
	fragment UserFragment on User {
		id
		name
	}

	fragment PlayedCardFragment on PlayedCard {
		id
		player {
			...UserFragment
		}
		isWinning
	}

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
						...UserFragment
					}
				score
				isActive
				tricksCalled
				tricksMade
				}
				leadColor
				leadCard {
					...PlayedCardFragment
				}
				round
				turn {
					...UserFragment
				}
				deck {
					...PlayedCardFragment
				}
			}
			roundState {
				trumpColor
				trumpCard
				round
				pastTrick {
					...PlayedCardFragment
				}
			}
		}
		requiredAction {
			type
			options
		}
	}
`
