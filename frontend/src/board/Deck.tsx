import React from "react"
import { createStyles, Grid, Paper, Popover, Theme, withStyles, WithStyles } from "@material-ui/core"
import { AmpStories, Filter1, Grade, LooksOne } from "@material-ui/icons"
import { useDrop } from "react-dnd"
import { ColorBox } from "../util"
import DisplayableCard from "./DisplayableCard"

interface Props extends WithStyles<typeof styles> {
	deck?: string[] | null
	deckColor?: string | null
	trickColor?: string | null
}

function Deck(props: Props) {
	const [{ isActive }, drop] = useDrop({
		accept: "card",
		collect: (monitor) => ({
			isActive: monitor.isOver() && monitor.canDrop()
		})
	})
	const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)
	console.log(anchorEl)
	return (
		<Paper
			className={props.classes.root}
			ref={drop}>
			<div className={props.classes.colorBox}>
				{
					!props.trickColor ? null :
						<ColorBox color={props.trickColor}>
							<Grade fontSize="large" />
						</ColorBox>
				}
				{
					!props.deckColor ? null :
						<ColorBox color={props.deckColor}>
							<LooksOne fontSize="large" />
						</ColorBox>
				}
			</div>
			<div className={props.classes.spacer} style={{ textAlign: "right" }}>
				{isActive ? "Spiele diese Karte." : "Ziehe eine Karte her."}
			</div>
			<DisplayableCard
				className={props.classes.cardDisplay}
				onClick={ev => {
					if (props.deck?.length) {
						setAnchorEl(ev.currentTarget)
					}
				}}
				location={props.deck && props.deck.length > 0 ? props.deck[props.deck.length - 1] : undefined} />
			<div className={props.classes.spacer}>
				{isActive ? "Spiele diese Karte." : "Ziehe eine Karte her."}
			</div>

			<Popover
				onClose={() => setAnchorEl(null)}
				open={anchorEl !== null && (props.deck?.length ?? 0) > 0}
				anchorEl={anchorEl}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center',
				}}>
				<Paper>
					<Grid container className={props.classes.cardHistory}>
						{
							props.deck?.map(location =>
								<Grid item>
									<DisplayableCard
										key={location}
										location={location} />
								</Grid>
							)
						}
					</Grid>
				</Paper>
			</Popover>
		</Paper>
	)
}

const styles = (theme: Theme) => createStyles({
	root: {
		padding: "16px",
		display: "flex",
		flexDirection: "row",
		alignItems: "center"
	},
	spacer: {
		flexGrow: 1
	},
	colorBox: {
		display: "flex",
		flexDirection: "column",
		position: "absolute",
		gap: theme.spacing()
	},
	cardDisplay: {
		margin: theme.spacing(2)
	},
	cardHistory: {
		gap: theme.spacing()
	}
})

export default withStyles(styles)(Deck)
