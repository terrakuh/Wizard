import React from "react"
import { Backdrop, CircularProgress, makeStyles, Theme } from "@material-ui/core"

interface Props {
	loading: boolean
}

export default function Loading({ loading }: Props) {
	const classes = useStyles()

	return (
		<Backdrop open={loading} className={classes.backdrop}>
			<CircularProgress hidden={!loading} color="primary" />
		</Backdrop>
	)
}

const useStyles = makeStyles((theme: Theme) => ({
	backdrop: {
		zIndex: theme.zIndex.modal + 1
	}
}))
