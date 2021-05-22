import { makeStyles, Typography } from "@material-ui/core"
import { CSSProperties } from "@material-ui/styles"
import { PlayedCard as PlayedCardSchema } from "../../types"
import { cardStyle } from "./styles"

type Size = "small" | "normal" | undefined
type DiscoEffect = "hue" | "saturate" | undefined

interface Props {
	card: PlayedCardSchema
	className?: string
	style?: CSSProperties
	size?: Size
	displayPlayer?: boolean
	discoEffect?: DiscoEffect
}

export default function PlayedCard(props: Props) {
	const classes = useStyles({ size: props.size })

	return (
		<div className={props.className} style={props.style}>
			<div className={`${classes.container} ${(classes as any)[props.discoEffect ?? ""] ?? ""}`}>
				<img
					className={classes.image}
					alt=""
					src={`/private/${props.card.id}.jpg`} />

				{
					props.displayPlayer ?
						<Typography variant="body1" color="textPrimary">
							{props.card.player.name}
						</Typography> : null
				}
			</div>
		</div>
	)
}

const useStyles = makeStyles(theme => ({
	container: {
		display: "flex",
		flexDirection: "column",
		gap: theme.spacing(1)
	},
	image: ({ size }: { size: Size }) => ({
		...cardStyle,
		height: size === "small" ? cardStyle.height / 2 : cardStyle.height,
		width: size === "small" ? cardStyle.width / 2 : cardStyle.width
	}),
	"@keyframes hue": {
		to: {
			filter: "hue-rotate(360deg)"
		}
	},
	"@keyframes saturate": {
		to: {
			filter: "saturate(5)"
		},
	},
	hue: {
		animation: "$hue 1.5s",
		animationIterationCount: "infinite",
		animationTimingFunction: "linear"
	},
	saturate: {
		animation: "$saturate 1s",
		animationIterationCount: "infinite",
		animationTimingFunction: "linear",
		animationDirection: "alternate"
	}
}))
