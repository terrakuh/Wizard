import { Grid, makeStyles, Paper, Popper } from "@material-ui/core"
import { useState } from "react"
import { PlayedCard } from "../types"
import { ReferenceObject } from "popper.js"
import { cardStyle } from "./card/styles"
import { History as HistoryIcon } from "@material-ui/icons"

interface Props {
	className?: string
	pastTrick: PlayedCard[] | null
	boundary: HTMLElement | null
}

export default function PastTrick(props: Props) {
	const classes = useStyles()
	const [anchor, setAnchor] = useState<ReferenceObject>()

	return (
		!props.pastTrick?.length ? null :
			<>
				<div className={props.className}>
					<Paper className={classes.root}
						onMouseEnter={ev => setAnchor(ev.currentTarget)}
						onMouseLeave={() => setAnchor(undefined)}>
						<HistoryIcon />
					</Paper>
				</div>

				<Popper
					open={anchor != null}
					placement="right"
					modifiers={{
						offset: {
							offset: "0,16"
						},
						preventOverflow: {
							boundariesElement: props.boundary
						}
					}}
					anchorEl={anchor}>
					<Paper className={classes.content}>
						<Grid container spacing={1}>
							{
								props.pastTrick?.map(card =>
									<Grid item key={card.id}>
										<img
											style={{
												...cardStyle,
												height: cardStyle.height / 2,
												width: cardStyle.width / 2
											}}
											alt=""
											src={`/private/${card.id}.jpg`} />
									</Grid>
								)
							}
						</Grid>
					</Paper>
				</Popper>
			</>
	)
}

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexDirection: "column",
		padding: theme.spacing(1),
		gap: theme.spacing(1)
	},
	pastTrick: {
		padding: theme.spacing(1)
	},
	content: {
		padding: theme.spacing(2)
	}
}))
