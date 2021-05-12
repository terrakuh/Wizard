import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, makeStyles, Typography } from "@material-ui/core";
import { Maximize, Minimize as MinimizeIcon } from "@material-ui/icons";
import { useSnackbar } from "notistack";
import { ReactNode, useState, useEffect, useCallback } from "react";

interface Props {
	open: boolean
	onCommit(): void
	title: string
	children?: ReactNode
}

export default function DialogTemplate(props: Props) {
	const classes = useStyles()
	const { enqueueSnackbar, closeSnackbar } = useSnackbar()
	const [minimize, setMinimize] = useState(false)
	const handleMinimize = useCallback(() => {
		setMinimize(true)
		const key = enqueueSnackbar("Aktion verfügbar.", {
			variant: "info",
			persist: true,
			action: () => null,
			style: {
				cursor: "pointer"
			},
			onClick() {
				closeSnackbar(key)
				setMinimize(false)
			}
		})
	}, [enqueueSnackbar, closeSnackbar])

	// reset
	useEffect(() => {
		if (props.open) {
			setMinimize(false)
		}
	}, [props.open])

	return (
		<Dialog open={props.open && !minimize} fullWidth>
			<DialogTitle className={classes.title} disableTypography>
				<Typography variant="h6" className={classes.titleText}>{props.title}</Typography>

				<IconButton onClick={handleMinimize}>
					<MinimizeIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent>{props.children}</DialogContent>

			<DialogActions>
				<Button
					onClick={props.onCommit}
					variant="contained"
					color="primary">
					Bestätigen
				</Button>
			</DialogActions>
		</Dialog>
	)
}

const useStyles = makeStyles({
	titleText: {
		flexGrow: 1
	},
	title: {
		display: "flex",
		alignItems: "center"
	}
})
