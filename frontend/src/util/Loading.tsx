import React from "react"
import { Backdrop, CircularProgress, makeStyles, Theme } from "@material-ui/core"

interface Props {
	loading: boolean
}

export default function Loading({ loading }: Props) {
	const classes = useStyles()

	return (
		!loading ? null :
			<Backdrop open className={classes.backdrop}>
				<CircularProgress color="primary" />
			</Backdrop>
	)
}

const useStyles = makeStyles((theme: Theme) => ({
	backdrop: {
		zIndex: theme.zIndex.modal + 1
	}
}))
