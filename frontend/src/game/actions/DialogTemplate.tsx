import { useMutation } from "@apollo/client";
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, makeStyles, Paper, PaperProps, Typography } from "@material-ui/core";
import { Minimize as MinimizeIcon } from "@material-ui/icons";
import gql from "graphql-tag";
import { useSnackbar } from "notistack";
import { ReactNode, useState, useCallback } from "react";
import Draggable from "react-draggable";
import { ThemedButton } from "../../theme";
import { Loading } from "../../util";

interface Props {
	onCommit(): CompleteActionVariables
	canCommit: boolean
	title: string
	children?: ReactNode
}

export default function DialogTemplate(props: Props) {
	const classes = useStyles()
	const { enqueueSnackbar, closeSnackbar } = useSnackbar()
	const [minimize, setMinimize] = useState(false)
	const [completeAction, { loading }] = useMutation<any, CompleteActionVariables>(COMPLETE_ACTION)
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

	return (
		<>
			<Dialog
				open={!minimize}
				PaperComponent={PaperComponent}
				fullWidth>
				<DialogTitle className={classes.title} disableTypography>
					<Typography variant="h6" className={classes.titleText}>{props.title}</Typography>

					<IconButton onClick={handleMinimize}>
						<MinimizeIcon />
					</IconButton>
				</DialogTitle>

				<DialogContent>{props.children}</DialogContent>

				<DialogActions>
					<ThemedButton
						disabled={!props.canCommit}
						onClick={async () => {
							try {
								await completeAction({ variables: props.onCommit() })
							} catch (err) {
								console.error(err)
								enqueueSnackbar("Stiche konnten nicht angesagt werden.", { variant: "error" })
							}
						}}
						variant="contained"
						color="primary">
						Bestätigen
					</ThemedButton>
				</DialogActions>
			</Dialog>

			<Loading loading={loading} />
		</>
	)
}

const useStyles = makeStyles({
	titleText: {
		flexGrow: 1
	},
	title: {
		display: "flex",
		alignItems: "center",
		cursor: "move"
	}
})

function PaperComponent(props: PaperProps) {
	return (
		<Draggable cancel={'[class*="MuiDialogContent-root"]'}>
			<Paper {...props} />
		</Draggable>
	)
}

interface CompleteActionVariables {
	option: string
}

const COMPLETE_ACTION = gql`
	mutation ($option: String!) {
		completeAction(option: $option)
	}
`
