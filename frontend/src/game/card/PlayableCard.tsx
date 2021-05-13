import { useMutation } from "@apollo/client"
import { makeStyles } from "@material-ui/core"
import { React } from "@ungap/global-this"
import gql from "graphql-tag"
import { useSnackbar } from "notistack"
import { useState } from "react"
import { useDrag } from "react-dnd"
import { PlayableCard as PlayableCardSchema } from "../../types"
import { cardStyle } from "./styles"

interface Props {
	card: PlayableCardSchema
	style?: React.CSSProperties
}

export default function PlayableCard(props: Props) {
	const classes = useStyles()
	const { enqueueSnackbar } = useSnackbar()
	const [playCard] = useMutation(PLAY_CARD)
	const handlePlay = async (id: string) => {
		try {
			const response = await playCard({ variables: { id } })
			if (response.errors) {
				throw response.errors
			}
		} catch (err) {
			console.error(err)
			enqueueSnackbar("Die Karte konnte nicht gespielt werden.", { variant: "error" })
		}
	}
	const [hovering, setHovering] = useState(false)
	const [, drag] = useDrag({
		item: {
			type: "card",
			id: props.card.id
		},
		async end(item, monitor) {
			if (item && monitor.getDropResult() != null) {
				await handlePlay(item.id)
			}
		}
	})

	return (
		<div
			ref={drag}
			onDoubleClick={() => handlePlay(props.card.id)}
			className={`${classes.root} ${hovering ? classes.hover : ""}`}
			onMouseEnter={() => setHovering(true)}
			onMouseLeave={() => setHovering(false)}
			style={props.style}>
			<img
				style={cardStyle}
				alt=""
				src={`/cards/${props.card.id}.jpg`} />
		</div>
	)
}

const useStyles = makeStyles({
	"@keyframes onHoverEnter": {
		from: {
			zIndex: 999
		},
		to: {
			zIndex: 999,
			bottom: 50,
			transform: "translateY(15%)"
		}
	},
	root: {
		// width: "fit-content"
		// background: "linear-gradient(235deg,#89ff0066,#060c2166,#00bcd466)"
	},
	hover: {
		animation: "$onHoverEnter .2s ease-in-out",
		animationFillMode: "forwards"
	}
})

const PLAY_CARD = gql`
	mutation ($id: String!) {
		completeAction(option: $id)
	}
`
