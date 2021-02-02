import React from "react"
import { createStyles, Typography, withStyles, WithStyles } from "@material-ui/core";

interface Props extends WithStyles<typeof styles> {
	color: string
	text: string
	className?: string
}

function ColorBox(props: Props) {
	return (
		<div
			style={{ backgroundColor: props.color }}
			className={`${props.classes.root} ${props.className ?? ""}`}>
			<Typography className={props.classes.text} align="center">{props.text}</Typography>
		</div>
	)
}

const styles = createStyles({
	root: {
		width: "50px",
		height: "50px"
	},
	text: {
		mixBlendMode: "difference"
	}
})

export default withStyles(styles)(ColorBox)
