import { Paper, Table, TableBody, TableCell, TableContainer, TableRow } from "@material-ui/core"
import { TrickState } from "../types"

interface Props {
	trickState: TrickState
	className?: string
}

export default function ScoreBoard(props: Props) {
	return (
		<div className={props.className}>
			<TableContainer component={Paper}>
				<Table>
					<TableBody>
						{
							props.trickState.playerStates.map(state =>
								<TableRow
									key={state.player.id}
									selected={state.player.id === props.trickState.turn?.id}>
									<TableCell>{state.score}</TableCell>
									<TableCell>{state.player.name}</TableCell>
									<TableCell>{state.tricksCalled != null && state.tricksMade != null ? `${state.tricksCalled} / ${state.tricksMade}` : ""}</TableCell>
								</TableRow>
							)
						}
					</TableBody>
				</Table>
			</TableContainer>
		</div>
	)
}
