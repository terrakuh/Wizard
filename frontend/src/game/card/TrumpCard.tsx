import { makeStyles } from "@material-ui/core"
import { cardStyle } from "./styles"

interface Props {
	className?: string
	trumpCard: string | null
	trumpColor: string | null
	leadCard: string | null
	leadColor: string | null
}

export default function TrumpCard(props: Props) {
	const classes = useStyles()

	return (
		<div className={props.className}>
			<div className={classes.root}>
				<div className={classes.cardContainer}>
					{
						props.trumpCard == null ? null :
							<img
								style={{ borderColor: props.trumpColor ?? "black" }}
								alt=""
								src={`/private/${props.trumpCard}.jpg`} />
					}
				</div>

				<div className={classes.cardContainer}>
					{
						props.leadCard == null ? null :
							<img
								className={classes.bottomHalf}
								style={{ borderColor: props.leadColor ?? "black" }}
								alt=""
								src={`/private/${props.leadCard}.jpg`} />
					}
				</div>
			</div>
		</div>
	)
}

const useStyles = makeStyles({
	root: {
		position: "relative"
	},
	cardContainer: {
		height: cardStyle.height / 4 + 8,
		overflow: "hidden",
		"&>img": {
			...cardStyle,
			height: cardStyle.height / 2,
			width: cardStyle.width / 2,
			borderStyle: "solid",
			borderWidth: 4
		}
	},
	bottomHalf: {
		marginTop: -cardStyle.height / 4 - 4,
		transform: "scaleY(-1)"
	}
})
