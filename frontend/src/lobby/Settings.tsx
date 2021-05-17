import { Lobby } from "../types"

interface Props {
	lobby: Lobby
}

export default function Settings(props: Props) {
	return (
		<div>
			Mode: {props.lobby.mode}
		</div>
	)
}
