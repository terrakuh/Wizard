import { useMutation } from "@apollo/client"
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableRow } from "@material-ui/core"
import gql from "graphql-tag"
import { useSnackbar } from "notistack"
import { useMemo } from "react"
import { useHistory } from "react-router-dom"
import { PlayerState, RoundState, TrickState } from "../types"

interface Props {
	trickState?: TrickState | null
	playerStates: PlayerState[]
	roundState: RoundState
	className?: string
}

export default function ScoreBoard(props: Props) {
	const winningPlayer = useMemo(() => props.trickState?.deck?.find(card => card.isWinning)?.player, [props.trickState])

	const { enqueueSnackbar } = useSnackbar()
	const [endGame] = useMutation(END_GAME, {
		onError(err) {
			console.error(err)
			enqueueSnackbar("Konnt Spiel nicht beenden.", { variant: "error" })
		}
	})
	const [leaveLobby] = useMutation(LEAVE_LOBBY, {
		onError(err) {
			console.error(err)
			enqueueSnackbar("Konnt Lobby nicht verlassen.", { variant: "error" })
		}
	})

	return (
		<div className={props.className}>
			<TableContainer component={Paper}>
				<Table>
					<TableBody>
						{
							props.playerStates.map(state =>
								<TableRow
									key={state.player.id}
									selected={state.isActive /* state.player.id === props.trickState.turn?.id */}>
									<TableCell>{state.score}</TableCell>
									<TableCell>
										{
											winningPlayer?.id === state.player.id ?
												<u><b>{state.player.name}</b></u> :
												state.player.name
										}
									</TableCell>
									<TableCell>{state.tricksCalled != null && state.tricksMade != null ? `${state.tricksMade} / ${state.tricksCalled}` : ""}</TableCell>
								</TableRow>
							)
						}

						<TableRow>
							<TableCell></TableCell>
							<TableCell>
								Runde: {props.roundState.round}<br />
								{props.trickState?.round == null ? null : `Stich: ${props.trickState?.round}`}
							</TableCell>
							<TableCell>{props.playerStates.reduce((prev, curr) => prev + (curr.tricksMade ?? 0), 0)} / {props.playerStates.reduce((prev, curr) => prev + (curr.tricksCalled ?? 0), 0)}</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</TableContainer>
			<Button variant="contained" color="primary" onClick={ev => endGame()}>End Game</Button>
			<Button variant="contained" color="primary" onClick={ev => leaveLobby()}>Leave Game</Button>
		</div>
	)
}

const END_GAME = gql`
	mutation {
		endGame
	}
`

const LEAVE_LOBBY = gql`
	mutation {
		leaveLobby
	}
`
