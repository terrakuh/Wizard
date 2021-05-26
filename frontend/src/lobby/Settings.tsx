import { useMutation, useQuery } from "@apollo/client"
import { FormControl, InputLabel, makeStyles, MenuItem, Select } from "@material-ui/core"
import gql from "graphql-tag"
import { useSnackbar } from "notistack"
import { Lobby } from "../types"

interface Props {
	lobby: Lobby
}

export default function Settings(props: Props) {
	const classes = useStyles()
	const { enqueueSnackbar } = useSnackbar()
	const { data } = useQuery<LobbyOptionsResult>(LOBBY_OPTIONS)
	const [setLobbySettings] = useMutation<any, SetLobbySettingsVariables>(SET_LOBBY_SETTINGS, {
		onError(err) {
			console.error(err)
			enqueueSnackbar("Einstellungen konnten nicht übernommen werden.", { variant: "error" })
		}
	})

	return (
		<FormControl
			className={classes.root}
			component="fieldset"
			disabled={props.lobby.canStart == null}>
			<FormControl>
				<InputLabel>Spiel-Modus</InputLabel>
				<Select
					onChange={ev => setLobbySettings({ variables: { mode: ev.target.value as string, roundLimit: null } })}
					value={props.lobby.mode}>
					{
						data?.modes.map(mode =>
							<MenuItem key={mode} value={mode}>{mode}</MenuItem>
						)
					}
				</Select>
			</FormControl>

			<FormControl>
				<InputLabel>Runden-Anzahl</InputLabel>
				<Select
					onChange={ev => setLobbySettings({ variables: { mode: null, roundLimit: ev.target.value as number } })}
					value={props.lobby.roundLimit}>
					{
						new Array(props.lobby.maxRounds).fill(0).map((_, index) =>
							<MenuItem key={index} value={index + 1}>{index + 1}</MenuItem>
						)
					}
				</Select>
			</FormControl>
		</FormControl>
	)
}

const useStyles = makeStyles(theme => ({
	root: {
		gap: theme.spacing(1)
	}
}))

interface LobbyOptionsResult {
	modes: string[]
}

const LOBBY_OPTIONS = gql`
	query {
		modes
	}
`

interface SetLobbySettingsVariables {
	mode: string | null
	roundLimit: number | null
}

const SET_LOBBY_SETTINGS = gql`
	mutation ($mode: String, $roundLimit: Int) {
		setLobbySettings(mode: $mode, roundLimit: $roundLimit)
	}
`
