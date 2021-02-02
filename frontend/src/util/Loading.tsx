import React from "react"
import { Backdrop, CircularProgress, createStyles, Theme, WithStyles, withStyles } from "@material-ui/core"

interface Props extends WithStyles<typeof styles> {
	open: boolean
}

function Loading(props: Props) {
	return (
		<Backdrop className={props.classes.backdrop} open={props.open}>
			<CircularProgress hidden={!props.open} color="primary" />
		</Backdrop>
	)
}

const styles = (theme: Theme) => createStyles({
	backdrop: {
		zIndex: theme.zIndex.modal + 1
	}
})

export default withStyles(styles)(Loading)
