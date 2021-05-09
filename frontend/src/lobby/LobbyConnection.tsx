import React from "react"
import { Button, createStyles, Grid, IconButton, makeStyles, Paper, TextField, Theme, WithStyles, withStyles } from "@material-ui/core"
import { FileCopy as FileCopyIcon } from "@material-ui/icons"
import { ApolloError, gql, useMutation } from "@apollo/client"
import { Lobby } from "../types"
import { useParams } from "react-router-dom"
import { Loading } from "../util"
import { useSnackbar, withSnackbar, WithSnackbarProps } from "notistack"

interface Props {
	lobbyInfo?: Lobby
}

export default function LobbyConnection(props: Props) {
	const classes = useStyles()
	const { enqueueSnackbar } = useSnackbar()
	const codeParam = useParams<{ code?: string }>().code
	const [code, setCode] = React.useState(codeParam || "")
	const [createLobby, { loading: creatingLobby }] = useMutation(CREATE_LOBBY)
	const [joinLobby, { loading: joiningLobby }] = useMutation(JOIN_LOBBY)
	const [startGame, { loading: startingGame }] = useMutation(START_GAME)

	const handleMainAction = (join: boolean) => async () => {
		try {
			if (join) {
				await joinLobby({ variables: { code } })
			} else {
				await createLobby()
			}
		} catch (err) {
			console.error(err)
			enqueueSnackbar((err as ApolloError).message, { variant: "error" })
		}
	}

	// React.useEffect(() => {
	// 	if (props.lobbyInfo) {
	// 		setLobby(props.lobbyInfo.id)
	// 	}
	// }, [props.lobbyInfo])

	return (
		<Paper className={classes.inputPaper}>
			<Loading loading={creatingLobby || joiningLobby || startingGame} />

			<Grid container spacing={2}>
				<Grid item xs={10} md={11}>
					<TextField
						fullWidth
						disabled={props.lobbyInfo !== undefined || codeParam != null}
						value={props.lobbyInfo?.code ?? code}
						onChange={x => setCode(x.target.value)}
						label="Lobby Code" />
				</Grid>
				<Grid item xs={2} md={1}>
					<IconButton
						disabled={!props.lobbyInfo?.code}
						color="secondary"
						onClick={async () => {
							try {
								await navigator.clipboard.writeText(`${window.location.origin}/lobby/${props.lobbyInfo?.code}`)
								enqueueSnackbar("In die Zwischenablage kopiert.", { variant: "success" })
							} catch (err) {
								console.error(err)
								enqueueSnackbar("URL konnte nicht kopiert werden.", { variant: "error" })
							}
						}}>
						<FileCopyIcon />
					</IconButton>
				</Grid>

				<Grid item xs={4} md={1}>
					{
						props.lobbyInfo == null ?
							codeParam == null && code === "" ?
								<Button
									onClick={handleMainAction(false)}
									variant="contained"
									color="primary">
									Erstellen
								</Button> :
								<Button
									onClick={handleMainAction(true)}
									variant="contained"
									color="primary">
									Beitreten
								</Button> :
							props.lobbyInfo.canStart == null ? null :
								<Button
									variant="contained"
									color="primary"
									onClick={async () => {
										try {
											await startGame()
										} catch (err) {
											console.error(err)
											enqueueSnackbar("Konnte das Spiel nicht starten.", { variant: "error" })
										}
									}}
									disabled={!props.lobbyInfo.canStart}>
									Starten
								</Button>
					}
				</Grid>

				{/* {
					!props.lobbyInfo?.canStart ? null :
						<Grid item xs={4} md={1}>
							<Button
								color="primary"
								variant="contained"
								onClick={() => {
									startGame()
										.catch(e => {
											console.error(e)
											props.enqueueSnackbar((e as ApolloError).message, { variant: "error" })
										})
								}}>
								Starten
								</Button>
						</Grid>
				} */}
			</Grid>
		</Paper >
	)
}

const useStyles = makeStyles((theme: Theme) => ({
	inputPaper: {
		padding: theme.spacing()
	}
}))

const CREATE_LOBBY = gql`
	mutation {
		createLobby
	}
`

const JOIN_LOBBY = gql`
	mutation ($code: String!) {
		joinLobby(code: $code)
	}
`

const START_GAME = gql`
	mutation {
		startGame
	}
`
