import React from "react"
import { Button, CircularProgress, createStyles, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Mark, Paper, PaperProps, Slider, Theme, Typography, WithStyles, withStyles } from "@material-ui/core"
import { TrickCalling } from "../types"
import { withSnackbar, WithSnackbarProps } from "notistack"
import { gql, useMutation } from "@apollo/client"
import { Loading } from "../util"
import Draggable from "react-draggable"

interface Props extends WithSnackbarProps, WithStyles<typeof styles> {
	context?: TrickCalling
	clearContext: () => void
}

function TrickCallDialog(props: Props) {
	const playersAfter = (props.context?.playersLeft ?? 1) - 1
	const marks = React.useMemo<Mark[]>(() => {
		if (props.context) {
			const limited = !playersAfter ? props.context.round - props.context.called : -1
			const marks: Mark[] = []
			for (let i = 0; i <= props.context.round; i++) {
				if (limited !== i) {
					marks[i] = {
						value: i,
						label: `${i}`
					}
				}
			}
			return marks
		}
		return []
	}, [props.context, playersAfter])
	const [calls, setCalls] = React.useState(marks[0]?.value ?? 0)
	const [callTricks, { loading: callingTricks }] = useMutation(CALL_TRICKS)

	return (
		<Dialog
			PaperComponent={PaperComponent}
			aria-labelledby="draggable-dialog-title"
			fullWidth
			open={props.context !== undefined}>
			<Loading open={callingTricks} />

			<DialogTitle
				className={props.classes.title}
				id="draggable-dialog-title">
				Call your Tricks
			</DialogTitle>

			<DialogContent>
				<DialogContentText>
					{props.context?.called} out of <u><strong>{props.context?.round}</strong></u> tricks were called.<br />
					{playersAfter ? `${playersAfter} player(s) have/has to call after you.` : "You are the last person to call."}
				</DialogContentText>
				<Slider
					value={calls}
					onChange={(_, x) => setCalls(x as number)}
					valueLabelDisplay="off"
					marks={marks}
					step={null}
					min={0}
					max={props.context?.round} />
			</DialogContent>

			<DialogActions>
				{
					props.context?.yourTurn ?
						<Button
							color="primary"
							variant="contained"
							onClick={() => {
								callTricks({ variables: { count: calls } })
									.then(props.clearContext)
									.catch(e => {
										console.error(e)
										props.enqueueSnackbar(e?.message ?? "Unexpected error.", { variant: "error" })
									})
							}}>
							Call
						</Button> :
						<div className={props.classes.waitingBox}>
							<Typography color="textPrimary">Waiting for other players...</Typography>
							<div className={props.classes.spacer} />
							<CircularProgress color="primary" size={25} />
						</div>
				}
			</DialogActions>
		</Dialog>
	)
}

const styles = (theme: Theme) => createStyles({
	waitingBox: {
		width: "100%",
		padding: theme.spacing(),
		gap: theme.spacing(),
		display: "flex",
		flexDirection: "row"
	},
	spacer: {
		flexGrow: 1
	},
	title: {
		cursor: "move"
	}
})

function PaperComponent(props: PaperProps) {
	return (
		<Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
			<Paper {...props} />
		</Draggable>
	);
}

const CALL_TRICKS = gql`
	mutation ($count: Int!) {
		callTricks(count: $count) {
			called
		}
	}
`

export default withStyles(styles)(withSnackbar(TrickCallDialog))
