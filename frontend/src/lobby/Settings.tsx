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

	//const roundOptions = data?.maxRounds ? data.maxRounds : 10
	//const a = [...Array(roundOptions).keys()]

	//console.log(roundOptions)
	//console.log()

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

				{/* <InputLabel>RundenAnzahl</InputLabel>
				<Select
					//onChange={(ev) => setLobbySettings({ variables: { mode: props.lobby.mode, maxRounds: ev.target.value as number } })}
					value={props.lobby.maxRounds}>
					{
						[...Array(roundOptions).keys()].slice(1).map(amount =>
							<MenuItem key={amount} value={amount}>{amount}</MenuItem>
						)
					}
				</Select> */}
			</FormControl>
		</div>
	)
}

interface LobbyOptionsResult {
	modes: string[]
	//maxRounds: number
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
