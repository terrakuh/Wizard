import React from "react"
import { List, ListItem, Paper, Typography } from "@material-ui/core"
import { User } from "../types"

interface Props {
	players: User[]
}

export default function PlayerList(props: Props) {
	return (
		<Paper>
			<List>
				{
					props.players.map((user, i) =>
						<ListItem 
							selected={i % 2 === 0}
							key={user.id}>
							<Typography variant="body1" color="textPrimary">{user.name}</Typography>
						</ListItem>
					)
				}
			</List>
		</Paper>
	)
}
