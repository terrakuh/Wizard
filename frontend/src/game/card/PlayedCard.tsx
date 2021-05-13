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
				src={`/private/${props.card.id}.jpg`} />
		</div>
	)
}
