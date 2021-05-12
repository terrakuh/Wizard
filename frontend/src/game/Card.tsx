import { makeStyles } from "@material-ui/core"
import { React } from "@ungap/global-this"
import { useSnackbar } from "notistack"
import { useState } from "react"

interface Props {
	src: string
	style?: React.CSSProperties
}

export default function Card(props: Props) {
	const classes = useStyles()
	const [hovering, setHovering] = useState(false)

	return (
		<div
			className={`${classes.root} ${hovering ? classes.hover : ""}`}
			onMouseEnter={() => setHovering(true)}
			onMouseLeave={() => setHovering(false)}
			style={props.style}>
			<img
				className={classes.card}
				alt=""
				src={props.src} />
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
	card: {
		borderRadius: 16
	},
	hover: {
		animation: "$onHoverEnter .2s ease-in-out",
		animationFillMode: "forwards"
	}
})
