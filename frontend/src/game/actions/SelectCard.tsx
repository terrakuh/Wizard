import { CSSProperties } from "@material-ui/styles"
import { useState } from "react"
import { cardStyle } from "../card/styles"

interface Props {
	card: string
    selected: boolean
    onClick: (s: string) => void
	className?: string
	style?: CSSProperties
}

export default function SelectCard(props: Props) {
    const style = {
        height: 150,
        borderRadius: 10,
        border: props.selected ? "solid 3px darkgrey" : ""
    }

	return (
		<div className={props.className} style={props.style}>
			<img
                onClick={() => props.onClick(props.card)}
				style={style}
				alt=""
				src={`/private/${props.card}.jpg`} />
		</div>
	)
}