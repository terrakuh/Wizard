import { makeStyles } from "@material-ui/core"
import { memo, useCallback, useState } from "react"
import { useDrag, useDrop } from "react-dnd"
import { PlayableCard as PlayableCardSchema } from "../../types"
import { cardStyle } from "./styles"
import usePlayCard from "./usePlayCard"

interface Props {
	card: PlayableCardSchema
	moveCard(from: string, to: string): void
}

function PlayableCard(props: Props) {
	const classes = useStyles()
	const playCard = usePlayCard()
	const [hovering, setHovering] = useState(false)
	const [{ thisIsDragging, isDragging }, drag] = useDrag({
		item: {
			type: "card",
			id: props.card.id
		},
		collect: (monitor) => ({
			thisIsDragging: monitor.isDragging(),
			isDragging: monitor.getItem() != null
		})
	})
	const [, drop] = useDrop({
		accept: "card",
		hover(item: any, monitor) {
			if (item.id !== props.card.id) {
				props.moveCard(item.id, props.card.id)
			}
		}
	})

	const setRefs = useCallback(element => {
		drag(element)
		drop(element)
	}, [drop, drag])

	return (
		<div
			ref={setRefs}
			onDoubleClick={() => playCard(props.card.id)}
			className={hovering && !isDragging ? classes.hover : undefined}
			onMouseEnter={() => setHovering(true)}
			onMouseLeave={() => setHovering(false)}>
			<img
				style={{
					...cardStyle,
					opacity: thisIsDragging ? 0 : 1,
					filter: props.card.playable ? undefined : "brightness(30%)"
				}}
				alt=""
				src={`/private/${props.card.id}.jpg`} />
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
			transform: "translateY(-15%)"
		}
	},
	hover: {
		animation: "$onHoverEnter .2s ease-in-out",
		animationFillMode: "forwards"
	}
})

export default memo(PlayableCard)
