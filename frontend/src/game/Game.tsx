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
import End from "./end/End"

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
			requiredAction: data.requiredAction,
			gameOver: data.gameOver
		}
	}, [data])

	if (data == null) {
		return <Loading loading={true} />
	} else if (data.gameInfo == null) {
		return <Redirect to="/lobby" />
	}

	const { gameInfo: { hand, trickState, roundState, playerStates } } = data

	if (data.gameOver) {
		return <End playerStates={playerStates}></End>
	}

	if (roundState == null) {
		return <Loading loading={true} />
	}

	return (
		<div className={classes.root} ref={setRootRef}>
			<div className={classes.dropArea} ref={drop}>
				<Deck cards={trickState?.deck ?? []} />

				<TrumpCard
					trumpCard={roundState.trumpCard}
					trumpColor={roundState.trumpColor}
					leadCard={trickState?.leadCard?.id ?? null}
					leadColor={trickState?.leadColor}
					className={classes.trumpCard} />
			</div>

			<PastTrick
				boundary={rootRef}
				className={classes.pastTrick}
				pastTrick={roundState.pastTrick?.deck} />

			<ScoreBoard
				roundState={roundState}
				className={classes.scoreBoard}
				trickState={trickState} 
				playerStates={playerStates}/>

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
	gameOver: Boolean
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

	fragment TrickStateFragment on TrickState {
		leadColor
		leadCard {
			...PlayedCardFragment
		}
		round
		deck {
			...PlayedCardFragment
		}
	}

	query {
		gameInfo {
			hand {
				id
				playable
			}
			trickState {
				...TrickStateFragment
			}
			roundState {
				trumpColor
				trumpCard
				round
				pastTrick {
					...TrickStateFragment
				}
			}
			playerStates {
				player {
					...UserFragment
				}
				score
				isActive
				tricksCalled
				tricksMade
			}
		}
		requiredAction {
			type
			options
		}
		gameOver
	}
`
