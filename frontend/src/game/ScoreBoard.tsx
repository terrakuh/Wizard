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
									<TableCell>{state.tricksCalled != null && state.tricksMade != null ? `${state.tricksMade} / ${state.tricksCalled}` : ""}</TableCell>
								</TableRow>
							)
						}

						<TableRow>
							<TableCell></TableCell>
							<TableCell>{props.trickState.round == null ? null : `Stich: ${props.trickState.round}`}</TableCell>
							<TableCell>{props.trickState.playerStates.reduce((prev, curr) => prev + (curr.tricksMade ?? 0), 0)} / {props.trickState.playerStates.reduce((prev, curr) => prev + (curr.tricksCalled ?? 0), 0)}</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</TableContainer>
		</div>
	)
}
