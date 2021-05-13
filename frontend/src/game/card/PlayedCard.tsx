import { Skeleton } from "@material-ui/lab"
import { CSSProperties } from "@material-ui/styles"
import { PlayedCard as PlayedCardSchema } from "../../types"
import { cardStyle } from "./styles"

interface Props {
	card: PlayedCardSchema
	className?: string
	style?: CSSProperties
}

export default function PlayedCard(props: Props) {
	return (
		<div className={props.className} style={props.style}>
			<img
				style={cardStyle}
				alt=""
				src={`/cards/${props.card.id}.jpg`} />
		</div>
	)
}
