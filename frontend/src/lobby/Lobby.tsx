import React from "react"
import { gql, useQuery } from "@apollo/client"
import { Lobby as LobbyType } from "../types"
import Connection from "./Connection"
import PlayerList from "./PlayerList"
import { Divider, makeStyles, Paper, Theme } from "@material-ui/core"
import { Redirect } from "react-router-dom"
import Settings from "./Settings"

export default function Lobby() {
	const classes = useStyles()
	const { data: info, stopPolling, startPolling } = useQuery<Info>(INFO)

	React.useEffect(() => {
		startPolling(1000)
		return stopPolling
	}, [startPolling, stopPolling])

	// redirect to game page when game started
	if (info?.gameInfo != null) {
		return <Redirect to="/game" />
	}

	return (
		<div className={classes.root}>
			<Paper className={classes.meta}>
				<Connection lobbyInfo={info?.lobby ?? undefined} />

				<Divider />

				{
					info?.lobby == null ? null : <Settings lobby={info.lobby} />
				}
			</Paper>

			{
				!info?.lobby?.players.length ? null :
					<Paper>
						<PlayerList players={info.lobby.players} />
					</Paper>
			}
		</div>
	)
}

const useStyles = makeStyles((theme: Theme) => ({
	root: {
		display: "flex",
		flexDirection: "column",
		gap: theme.spacing(1)
	},
	meta: {
		display: "flex",
		flexDirection: "column",
		padding: theme.spacing(2),
		gap: theme.spacing(1)
	}
}))

interface Info {
	lobby: LobbyType | null
	gameInfo: {} | null
}

const INFO = gql`
	query {
		lobby {
			code
			mode
			maxRounds
			roundLimit
			players {
				id
				name
			}
			canStart
		}
		gameInfo {
			__typename
		}
	}
`
