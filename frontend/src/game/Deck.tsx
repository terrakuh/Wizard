import { makeStyles } from "@material-ui/core"
import { Skeleton } from "@material-ui/lab"
import { PlayedCard } from "./card"
import { PlayedCard as PlayedCardSchema } from "../types"
import { cardStyle } from "./card/styles"
import { useState } from "react"

interface Props {
	cards: PlayedCardSchema[]
}

export default function Deck({ cards }: Props) {
	const classes = useStyles()
	const [rotations, setRotations] = useState<number[]>([])

	if (rotations.length < cards.length) {
		const copy = [...rotations]
		for (let i = rotations.length; i < cards.length; i++) {
			copy.push(Math.random() * 15 * ((copy[i - 1] ?? 0) < 0 ? 1 : -1))
		}
		setRotations(copy)
	} else if (rotations.length > cards.length) {
		setRotations([...rotations.slice(0, cards.length)])
	}

	return (
		<div className={classes.root}>
			{
				cards.length === 0 ?
					<Skeleton variant="rect" style={cardStyle} /> :
					cards.map((card, index) =>
						<PlayedCard
							key={card.id}
							className={classes.card}
							style={{
								transform: `translate(-50%, -50%) rotate(${rotations[index] ?? 0}deg)`
							}}
							card={card} />
					)
			}
		</div>
	)
}

const useStyles = makeStyles({
	root: {
		widht: "100%",
		height: "100%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		position: "relative"
	},
	card: {
		position: "absolute",
		top: "50%",
		left: "50%"
	}
})
