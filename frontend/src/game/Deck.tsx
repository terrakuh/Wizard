import { makeStyles, Paper, Popper } from "@material-ui/core"
import { Skeleton } from "@material-ui/lab"
import { PlayedCard } from "./card"
import { PlayedCard as PlayedCardSchema } from "../types"
import { cardStyle } from "./card/styles"
import { useRef, useState } from "react"
import { ReferenceObject } from "popper.js"

interface Props {
	cards: PlayedCardSchema[]
}

export default function Deck({ cards }: Props) {
	const classes = useStyles()
	const [rotations, setRotations] = useState<number[]>([])
	const [anchor, setAnchor] = useState<ReferenceObject>()

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
		<div
			onClick={ev => setAnchor(anchor == null ? ev.currentTarget : undefined)}
			className={classes.root}>
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

			<Popper
				anchorEl={anchor}
				open={anchor != null}>
				<Paper>
					{
						cards.map(card =>
							<PlayedCard key={card.id} card={card} />
						)
					}
				</Paper>
			</Popper>
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
