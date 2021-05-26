import { makeStyles } from "@material-ui/core"
import { PlayableCard as PlayableCardSchema } from "../types"
import { PlayableCard } from "./card"
import AutoSizer from "react-virtualized-auto-sizer"
import { memo, useCallback, useEffect, useState } from "react"
import { sortByReference } from "./card/sorter"

interface Props {
	cards: PlayableCardSchema[]
}

function Hand(props: Props) {
	const classes = useStyles()
	const [cards, setCards] = useState<PlayableCardSchema[]>([])
	const moveCard = useCallback((from, to) => {
		const fromIndex = cards.findIndex(card => card.id === from)
		const toIndex = cards.findIndex(card => card.id === to)
		const copy = [...cards]
		copy.splice(toIndex, 0, copy.splice(fromIndex, 1)[0])
		setCards(copy)
	}, [cards])

	// update cards when input changed
	useEffect(() => {
		setCards(sortByReference(props.cards, cards))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.cards])

	return (
		<div className={classes.root}>
			<AutoSizer>
				{
					({ width }) => {
						const CARD_WIDTH = 179
						const CARD_HEIGHT = 280
						const WIDTH = width - CARD_HEIGHT
						const CUT_WIDTH = 200
						const step = WIDTH / (props.cards.length + 1)
						const foo = (x: number) => Math.sqrt(1 - Math.pow((x - WIDTH / 2) / (WIDTH / 2 + CUT_WIDTH), 2))

						return cards.map((card, index) => {
							const x = (index + 1) * step
							const y = foo(x)

							return <PlayableCard
								moveCard={moveCard}
								style={{
									position: "absolute",
									bottom: y * 150 - 200,
									left: x - CARD_WIDTH / 2 + CARD_HEIGHT / 2,
									transform: `rotate(${Math.PI / 2 * (1 - y) * (index < props.cards.length / 2 ? -1 : 1)}rad)`,
									filter: card.playable ? undefined : "brightness(30%)"
								}}
								key={card.id}
								card={card} />
						})
					}
				}
			</AutoSizer>
		</div>
	)
}

const useStyles = makeStyles(theme => ({
	root: {
		position: "relative",
		height: 300,
		overflow: "hidden",
		bottom: -theme.spacing(1)
	}
}))

export default memo(Hand)
