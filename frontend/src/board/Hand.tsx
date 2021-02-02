import React from "react"
import { createStyles, Grid, withStyles, WithStyles } from "@material-ui/core"
import { Card } from "../types"
import PlayableCard from "./PlayableCard"
import { gql, useQuery } from "@apollo/client"

interface Props extends WithStyles<typeof styles> {
	hand: Card[]
}

function Hand(props: Props) {

	return (
		<Grid container spacing={2}>
			{
				props.hand.map(card =>
					<Grid item>
						<PlayableCard
							key={card.id}
							card={card}
							onHandUpdate={() => { }} />
					</Grid>
				)
			}
		</Grid>
	)
}

const styles = createStyles({
	root: {
		display: "flex",
		flexDirection: "row",
		gap: "8px"
	}
})

export default withStyles(styles)(Hand)
