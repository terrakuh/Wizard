import React from "react"
import { Paper, TableBody, TableCell, TableContainer, TableRow } from "@material-ui/core"
import { Score } from "../types"

interface Props {
	scores: Score[]
	turn: string | null
	className?: string
}

function ScoreBoard(props: Props) {
	return (
		<div className={props.className}>
			<TableContainer component={Paper}>
				<TableBody>
					{
						props.scores.map(score =>
							<TableRow
								selected={score.name === props.turn}
								key={score.name}>
								<TableCell>{score.points}</TableCell>
								<TableCell>{score.name}</TableCell>
								<TableCell>{score.trick === null ? null : `${score.trick.actual} / ${score.trick.called}`}</TableCell>
							</TableRow>
						)
					}
				</TableBody>
			</TableContainer>
		</div>
	)
}

export default ScoreBoard
