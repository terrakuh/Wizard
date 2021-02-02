import React from "react"
import { gql, useQuery } from "@apollo/client"
import { Lobby as LobbyType } from "../types"
import LobbyConnection from "./LobbyConnection"
import PlayerList from "./PlayerList"
import { Grid } from "@material-ui/core"
import { RouteComponentProps, withRouter } from "react-router-dom"

function Lobby(props: RouteComponentProps) {
	const { data: info } = useQuery<Info>(INFO, { pollInterval: 1000 })

	React.useEffect(() => {
		if (info?.gameInProgress) {
			props.history.push("/game")
		}
	}, [info, props.history])

	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<LobbyConnection lobbyInfo={info?.lobby ?? undefined} />
			</Grid>

			{
				info?.lobby == null ? null :
					<Grid item xs={12}>
						<PlayerList players={info.lobby.playerNames} />
					</Grid>
			}
		</Grid>
	)
}

interface Info {
	lobby: LobbyType | null
	gameInProgress: boolean
}

const INFO = gql`
	query {
		lobby {
			id
			playerNames
			canStart
		}
		gameInProgress
	}
`

export default withRouter(Lobby)
