import React from "react"
import { Button, createStyles, Grid, IconButton, Paper, TextField, Theme, WithStyles, withStyles } from "@material-ui/core"
import { FileCopy as FileCopyIcon } from "@material-ui/icons"
import { ApolloError, gql, useMutation } from "@apollo/client"
import { Lobby } from "../types"
import { useParams } from "react-router-dom"
import { Loading } from "../util"
import { withSnackbar, WithSnackbarProps } from "notistack"

interface Props extends WithStyles<typeof styles>, WithSnackbarProps {
	lobbyInfo?: Lobby
}

function LobbyConnection(props: Props) {
	const [name, setName] = React.useState(localStorage.getItem("name") ?? "")
	const [lobby, setLobby] = React.useState(useParams<{ id?: string }>().id || "")
	const [createLobby, { loading: creatingLobby }] = useMutation(CREATE_LOBBY)
	const [joinLobby, { loading: joiningLobby }] = useMutation(JOIN_LOBBY)
	const [startGame, { loading: startingGame }] = useMutation(START_GAME)

	React.useEffect(() => {
		if (props.lobbyInfo) {
			setLobby(props.lobbyInfo.id)
		}
	}, [props.lobbyInfo])

	return (
		<Paper className={props.classes.inputPaper}>
			<Loading open={creatingLobby || joiningLobby || startingGame} />

			<Grid container spacing={2}>
				<Grid item xs={12} md={6}>
					<TextField
						fullWidth
						disabled={props.lobbyInfo !== undefined}
						value={name}
						onChange={x => setName(x.target.value)}
						label="Player Name" />
				</Grid>

				<Grid item xs={10} md={5}>
					<TextField
						fullWidth
						disabled={props.lobbyInfo !== undefined}
						value={lobby}
						onChange={x => setLobby(x.target.value)}
						label="Lobby Code" />
				</Grid>
				<Grid item xs={2} md={1}>
					<IconButton
						disabled={lobby === ""}
						color="secondary"
						onClick={() => {
							navigator.clipboard.writeText(`${window.location.origin}/lobby/${lobby}`)
								.catch(console.error)
						}}>
						<FileCopyIcon />
					</IconButton>
				</Grid>

				<Grid item xs={4} md={1}>
					<Button
						disabled={props.lobbyInfo !== undefined || name === "" || lobby === ""}
						color="primary"
						variant="contained"
						onClick={() => {
							localStorage.setItem("name", name)
							joinLobby({ variables: { name, lobby } })
								.catch(e => {
									console.error(e)
									props.enqueueSnackbar((e as ApolloError).message, { variant: "error" })
								})
						}}>
						Join
						</Button>
				</Grid>

				<Grid item xs={4} md={1}>
					<Button
						disabled={props.lobbyInfo !== undefined || name === ""}
						color="primary"
						variant="contained"
						onClick={() => {
							localStorage.setItem("name", name)
							createLobby({ variables: { name } })
								.catch(e => {
									console.error(e)
									props.enqueueSnackbar((e as ApolloError).message, { variant: "error" })
								})
						}}>
						Create
						</Button>
				</Grid>

				{
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
								Start
								</Button>
						</Grid>
				}
			</Grid>
		</Paper>
	)
}

const styles = (theme: Theme) => createStyles({
	inputPaper: {
		padding: theme.spacing()
	}
})

const CREATE_LOBBY = gql`
	mutation ($name: String!) {
		createLobby(playerName: $name) {
			id
		}
	}
`

const JOIN_LOBBY = gql`
	mutation ($name: String!, $lobby: ID!) {
		joinLobby(id: $lobby, playerName: $name) {
			id
		}
	}
`

const START_GAME = gql`
	mutation {
		startGame
	}
`

export default withStyles(styles)(withSnackbar(LobbyConnection))
