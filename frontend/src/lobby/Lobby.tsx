import React from "react"
import { gql, useQuery } from "@apollo/client"
import { Lobby as LobbyType } from "../types"
import LobbyConnection from "./LobbyConnection"
import PlayerList from "./PlayerList"
import { Grid } from "@material-ui/core"
import { useHistory } from "react-router-dom"

export default function Lobby() {
	const history = useHistory()
	const { data: info, stopPolling, startPolling } = useQuery<Info>(INFO)

	React.useEffect(() => {
		startPolling(1000)
		return stopPolling
	}, [startPolling, stopPolling])

	// redirect to game page when game started
	// React.useEffect(() => {
	// 	if (info?.roundState) {
	// 		history.push("/game")
	// 	}
	// }, [info, history])

	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<LobbyConnection lobbyInfo={info?.lobby ?? undefined} />
			</Grid>

			{
				info?.lobby == null ? null :
					<Grid item xs={12}>
						<PlayerList players={info.lobby.players} />
					</Grid>
			}
		</Grid>
	)
}

interface Info {
	lobby: LobbyType | null
	// roundState: {} | null
}

const INFO = gql`
	query {
		lobby {
			code
			mode
			players {
				id
				name
			}
			canStart
		}
	}
`
