import React from "react"
import { List, ListItem, Paper, Typography } from "@material-ui/core"

interface Props {
	players: string[]
}

function PlayerList(props: Props) {
	return (
		<Paper>
			<List>
				{
					props.players.map((name, i) =>
						<ListItem 
							selected={i % 2 === 0}
							key={name}>
							<Typography variant="body1" color="textPrimary">{name}</Typography>
						</ListItem>
					)
				}
			</List>
		</Paper>
	)
}

export default PlayerList
