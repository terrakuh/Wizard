import React from "react"
import { Box, createStyles, Paper, TableBody, TableCell, TableContainer, TableRow, Theme, withStyles, WithStyles } from "@material-ui/core"
import { Score } from "../types"

interface Props extends WithStyles<typeof styles> {
	scores: Score[]
	turn: string | null
	className?: string
}

function ScoreBoard(props: Props) {
	return (
		<Box boxShadow={3} className={props.className}>
			<TableContainer component={Paper}>
				<TableBody>
					{
						props.scores.map(score =>
							<TableRow
								classes={{ selected: props.classes.selected }}
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
		</Box>
	)
}

const styles = (theme: Theme) => createStyles({
	selected: {
		backgroundColor: `${theme.palette.secondary.main} !important`
	}
})

export default withStyles(styles)(ScoreBoard)
