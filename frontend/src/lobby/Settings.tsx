import { useMutation, useQuery } from "@apollo/client"
import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core"
import gql from "graphql-tag"
import { useSnackbar } from "notistack"
import { Lobby } from "../types"

interface Props {
	lobby: Lobby
}

export default function Settings(props: Props) {
	const { enqueueSnackbar } = useSnackbar()
	const { data } = useQuery<LobbyOptionsResult>(LOBBY_OPTIONS)
	const [setLobbySettings] = useMutation<any, SetLobbySettingsVariables>(SET_LOBBY_SETTINGS, {
		onError(err) {
			console.error(err)
			enqueueSnackbar("Einstellungen konnten nicht übernommen werden.", { variant: "error" })
		}
	})

	return (
		<div>
			<FormControl disabled={props.lobby.canStart == null}>
				<InputLabel>SpielModus</InputLabel>
				<Select
					onChange={(ev) => setLobbySettings({ variables: { mode: ev.target.value as string } })}
					value={props.lobby.mode}>
					{
						data?.modes.map(mode =>
							<MenuItem key={mode} value={mode}>{mode}</MenuItem>
						)
					}
				</Select>
			</FormControl>
		</div>
	)
}

interface LobbyOptionsResult {
	modes: string[]
}

const LOBBY_OPTIONS = gql`
	query {
		modes
	}
`

interface SetLobbySettingsVariables {
	mode: string
}

const SET_LOBBY_SETTINGS = gql`
	mutation ($mode: String!) {
		setLobbySettings(mode: $mode)
	}
`
