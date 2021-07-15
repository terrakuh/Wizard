import { useMutation } from "@apollo/client"
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableRow } from "@material-ui/core"
import gql from "graphql-tag"
import { useHistory } from "react-router-dom"
import { PlayerState } from "../../types"
import { useSnackbar } from "notistack"

interface Props {
	playerStates: PlayerState[]
}

export default function Item(props: Props) {
    props.playerStates.sort((a, b) => a.score - b.score)

	const history = useHistory()

	const { enqueueSnackbar } = useSnackbar()
	const [closeLobby] = useMutation(CLOSE_LOBBY, {
		onError(err) {
			console.error(err)
			enqueueSnackbar("Konnte Lobby nicht schließen.", { variant: "error" })
		}
	})

	return (
		<div>
            And the winner is...<br></br>
            <TableContainer component={Paper}>
				<Table>
					<TableBody>
						{
							props.playerStates.map(state =>
								<TableRow
									key={state.player.id}>
                                    <TableCell>{state.player.name}</TableCell>
									<TableCell>{state.score}</TableCell>
								</TableRow>
							)
						}
					</TableBody>
				</Table>
			</TableContainer>
			<Button variant="contained" color="primary" onClick={() => history.push("/lobby")}>Lobby</Button>
			<Button variant="contained" color="primary" onClick={ev => closeLobby()}>Close Lobby</Button>
        </div>
	)
}

const CLOSE_LOBBY = gql`
	mutation {
		closeLobby
	}
`