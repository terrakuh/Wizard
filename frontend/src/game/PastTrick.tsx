import { Grid, makeStyles, Paper, Popper, Typography } from "@material-ui/core"
import { useEffect, useState } from "react"
import { PlayedCard } from "../types"
import { ReferenceObject } from "popper.js"
import { cardStyle } from "./card/styles"
import { History as HistoryIcon } from "@material-ui/icons"

interface Props {
	className?: string
	pastTrick: PlayedCard[] | null | undefined
	boundary: HTMLElement | null
}

export default function PastTrick(props: Props) {
	const classes = useStyles()
	const [anchor, setAnchor] = useState<ReferenceObject>()

	useEffect(() => setAnchor(undefined), [props.pastTrick])

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
									<Grid item key={card.id} className={classes.item}>
										<img
											style={{
												...cardStyle,
												height: cardStyle.height / 2,
												width: cardStyle.width / 2
											}}
											alt=""
											src={`/private/${card.id}.jpg`} />

										<Typography
											variant="body1"
											color="textPrimary">
											{
												card.isWinning ?
													<u><b>{card.player.name}</b></u> :
													card.player.name
											}
										</Typography>
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
	},
	item: {
		display: "flex",
		flexDirection: "column",
		gap: theme.spacing(1)
	}
}))
