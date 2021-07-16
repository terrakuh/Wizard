import { makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from "@material-ui/core"
import { PlayerState } from "../types"
import { useMemo } from "react"
import { Delete as DeleteIcon, Star as StarIcon, StarHalf as StarHalfIcon } from "@material-ui/icons"

interface Props {
	playerStates: PlayerState[]
}

export default function End(props: Props) {
	const classes = useStyles()
	const playerStates = useMemo(() => props.playerStates.sort((a, b) => a.score - b.score), [props.playerStates])

	return (
		<div className={classes.root}>
			<Typography variant="h6" color="textPrimary">And the winner is...</Typography>
			<TableContainer component={Paper}>
				<Table>
					<TableBody>
						{
							playerStates.map((state, index) =>
								<TableRow
									key={state.player.id}>
									<TableCell>{ICONS[index] ?? (index + 1 === playerStates.length ? <DeleteIcon htmlColor="#808080" /> : null)}</TableCell>
									<TableCell>{state.player.name}</TableCell>
									<TableCell>{state.score}</TableCell>
								</TableRow>
							)
						}
					</TableBody>
				</Table>
			</TableContainer>
		</div>
	)
}

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexDirection: "column",
		gap: theme.spacing(2),
		margin: theme.spacing(1)
	}
}))

const ICONS = [<StarIcon htmlColor="#ffd700" />, <StarHalfIcon />]
