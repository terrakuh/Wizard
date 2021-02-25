import React from "react"
import { Box, createStyles, Tooltip, withStyles, WithStyles } from "@material-ui/core";

interface Props extends WithStyles<typeof styles> {
	color: string
	children: React.ReactNode
	className?: string
	tooltip: string
}

function ColorBox(props: Props) {
	return (
		<Tooltip title={props.tooltip}>
			<Box boxShadow={3}>
				<div
					style={{ backgroundColor: props.color }}
					className={`${props.classes.background} ${props.className ?? ""}`}>
					{props.children}
				</div>
			</Box>
		</Tooltip>
	)
}

const styles = createStyles({
	background: {
		width: "50px",
		height: "50px",
		display: "flex",
		alignItems: "center",
		justifyContent: "center"
	}
})

export default withStyles(styles)(ColorBox)
