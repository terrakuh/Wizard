import { gql, useMutation, useQuery } from "@apollo/client"
import { CancelPresentation as CancelPresentationIcon, MeetingRoom as MeetingRoomIcon, VideogameAsset as VideogameAssetIcon } from "@material-ui/icons"
import { useHistory } from "react-router-dom"
import Item from "./Item"

interface Props {
	onClose(): void
}

export default function GameSection(props: Props) {
	const history = useHistory()
	const { data: lobbyResult } = useQuery<LobbyResult>(LOBBY, { fetchPolicy: "cache-first" })
	const [endGame] = useMutation(END_GAME)
	const [leaveLobby] = useMutation(LEAVE_LOBBY)

	return (
		<>
			{
				lobbyResult?.lobby == null ?
					<Item
						onClick={() => {
							history.push("/lobby")
							props.onClose()
						}}
						icon={<VideogameAssetIcon />}
						title="Spiel" /> :
					<>
						<Item
							onClick={async () => {
								try {
									await leaveLobby()
								} catch (err) {
									console.error(err)
								}
								history.push("/lobby")
								props.onClose()
							}}
							icon={<MeetingRoomIcon />}
							title="Verlassen" />

						<Item
							onClick={async () => {
								try {
									await endGame()
								} catch (err) {
									console.error(err)
								}
								history.push("/lobby")
								props.onClose()
							}}
							icon={<CancelPresentationIcon />}
							title="Spiel Beenden" />
					</>
			}
		</>
	)
}

const END_GAME = gql`
	mutation {
		endGame
	}
`

const LEAVE_LOBBY = gql`
	mutation {
		leaveLobby
	}
`

interface LobbyResult {
	lobby: {} | null
}

const LOBBY = gql`
	query {
		lobby {
			__typename
		}
	}
`
