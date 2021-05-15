import { CSSProperties } from "@material-ui/styles"
import { cardStyle } from "./styles"

interface Props {
	card: string | null
    trumpColor: string | null
	className?: string
	style?: CSSProperties
}

export default function PlayedCard(props: Props) {
    let hexColor: String

    switch (props.trumpColor) {
        case "red":
            hexColor = "#de524e"
            break;
        case "green":
            hexColor = "#2bad5a"
            break;
        case "yellow":
            hexColor = "#f7dc6f"
            break;
        case "blue":
            hexColor = "#4587e1"
            break;
        default:
            hexColor = "#000000";
            break;
    };
    const style = {...cardStyle, border: "solid 5px " + hexColor}

	return (
		<div className={props.className} style={props.style}>
			<img
				style={style}
				alt=""
				src={`/private/${props.card}.jpg`} />
		</div>
	)
}