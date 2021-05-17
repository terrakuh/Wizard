import { Grid, makeStyles, Paper, Popper } from "@material-ui/core"
import { Skeleton } from "@material-ui/lab"
import { PlayedCard } from "./card"
import { PlayedCard as PlayedCardSchema } from "../types"
import { cardStyle } from "./card/styles"
import { useState } from "react"
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
			onClick={ev => {
				if (anchor == null) {
					let rect = ev.currentTarget.getBoundingClientRect()
					rect = new DOMRect(rect.x + rect.width / 2, rect.y + rect.height / 2 - 140, 1, 1)
					setAnchor({
						clientHeight: ev.currentTarget.clientHeight,
						clientWidth: ev.currentTarget.clientWidth,
						getBoundingClientRect() {

							return rect
						}
					})
				} else {
					setAnchor(undefined)
				}
				setAnchor(anchor == null ? ev.currentTarget : undefined)
			}}
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
				placement="top"
				modifiers={{
					preventOverflow: {
						enabled: true,
						boundariesElement: "viewport",
					}
				}}
				open={anchor != null}>
				<Grid container component={Paper} spacing={2}>
					{
						cards.map(card =>
							<Grid item key={card.id} >
								<PlayedCard card={card} />
							</Grid>
						)
					}
				</Grid>
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
