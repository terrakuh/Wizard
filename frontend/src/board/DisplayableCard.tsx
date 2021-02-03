import { Skeleton } from "@material-ui/lab"
import React from "react"
import cardStyles from "./cardStyles.json"

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	location?: string | null
}

function DisplayableCard(props: Props) {
	return (
		<div
			className={props.className}
			onClick={props.onClick}>
			{
				!props.location ? <Skeleton style={cardStyles} variant="rect" /> :
					<img
						style={cardStyles}
						src={`/cards/${props.location}.jpg`}
						alt={props.location}
						draggable={false} />
			}
		</div>
	)
}

export default DisplayableCard
