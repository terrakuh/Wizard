import { Grid, makeStyles } from "@material-ui/core"
import { useState } from "react"
import DialogTemplate from "./DialogTemplate"

interface Props {
	infoText: string
	options: string[]
}

export default function Selection(props: Props) {
	const classes = useStyles()
	const [selected, setSelected] = useState<string>()

	return (
		<DialogTemplate
			title={`Wähle aus: ${props.infoText}`}
			canCommit={selected != null}
			onCommit={() => ({ option: selected ?? "" })}>
			<Grid container spacing={2} className={classes.container}>
				{
					props.options.map(option =>
						<Grid item key={option}>
							<div
								className={classes.item}
								style={selected === option ? {
									border: `solid 4px ${toBorderColor(option)}`,
									borderRadius: 14,
									animation: `onSelectItem420 1s`,
									animationIterationCount: "infinite",
									animationTimingFunction: "linear"
								} : undefined}>
								<img
									className={`${classes.image} ${selected === option ? classes.selected : ""}`}
									onClick={() => setSelected(option)}
									alt=""
									src={`/private/${option}.jpg`} />
							</div>
						</Grid>
					)
				}
			</Grid>
		</DialogTemplate>
	)
}

const useStyles = makeStyles(theme => ({
	"@keyframes onSelect": {
		to: {
			filter: "hue-rotate(360deg)"
		}
	},
	"@global": {
		"@keyframes onSelectItem420": {
			"25%": {
				transform: "rotate(90deg) scale(1.3)"
			},
			"50%": {
				transform: "rotate(180deg) scale(1)"
			},
			"75%": {
				transform: "rotate(270deg) scale(1.3)"
			},
			"100%": {
				transform: "rotate(360deg) scale(1)"
			}
		}
	},
	container: {
		justifyContent: "space-around",
		alignItems: "center",
		overflow: "hidden",
		padding: theme.spacing(4)
	},
	item: {
		height: 150,
	},
	image: {
		height: 150,
		borderRadius: 10
	},
	selected: {
		animation: "$onSelect 1s",
		animationIterationCount: "infinite",
		animationTimingFunction: "linear"
	}
}))

function toBorderColor(option: string) {
	switch (option = option.split("_")[0]) {
		case "red": case "blue": case "green": case "yellow": return option
		default: return "white"
	}
}
