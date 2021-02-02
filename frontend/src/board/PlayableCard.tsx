import React from "react"
import { createStyles, WithStyles, withStyles } from "@material-ui/core"
import { useDrag } from "react-dnd"
import { Card as CardType } from "../types"
import cardStyles from "./cardStyles.json"
import { gql, useMutation } from "@apollo/client"
import { withSnackbar, WithSnackbarProps } from "notistack"

interface Props extends WithStyles<typeof styles>, WithSnackbarProps {
	card: CardType
	onHandUpdate: (hand: CardType[]) => void
}

function PlayableCard(props: Props) {
	const [playCard] = useMutation<{ hand: CardType[] | null }>(PLAY_CARD)
	const [{ isDragging }, drag] = useDrag({
		item: {
			type: "card",
			id: props.card.id
		},
		async end(item, monitor) {
			if (item && monitor.getDropResult() != null) {
				playCard({ variables: { id: item.id } })
					.then(({ data }) => {
						if (data?.hand != null) {
							props.onHandUpdate(data.hand)
						}
					})
					.catch(e => {
						console.error(e)
						props.enqueueSnackbar(e?.message ?? "Unknonw error.", { variant: "error" })
					})
			}
		},
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	})

	return (
		<div
			style={{ opacity: isDragging ? 0 : 1 }}
			className={props.classes.root}
			ref={drag}>
			<img
				style={cardStyles}
				src={`/cards/${props.card.location}.jpg`}
				alt={props.card.location}
				draggable={false} />
		</div>
	)
}

const styles = createStyles({
	root: {
		cursor: "move"
	}
})

const PLAY_CARD = gql`
	mutation ($id: ID!) {
		hand: playCard(cardID: $id) {
			id
			location
			playable
		}
	}
`

export default withStyles(styles)(withSnackbar(PlayableCard))
