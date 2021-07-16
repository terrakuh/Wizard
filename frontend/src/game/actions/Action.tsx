import { PlayerState, RequiredAction, RoundState, TrickState } from "../../types"
import TrickCalling from "./TrickCalling"
import Selection from "./Selection"
import { useNotification } from "../../settings"
import { useEffect } from "react"

interface Props {
	info: {
		requiredAction: RequiredAction
		roundState: RoundState | null
		trickState?: TrickState | null
		playerStates: PlayerState[]
	} | null
}

export default function Action(props: Props) {
	const notify = useNotification()

	useEffect(() => {
		if (props.info?.requiredAction.type != null) {
			notify("Du bist am Zug. Tschu-tschu")
		}
	}, [notify, props.info])

	if (props.info && props.info.roundState) {
		const reqAction = props.info?.requiredAction.type

		if (reqAction === "call_tricks") {
			return (
				<TrickCalling
					roundState={props.info.roundState}
					trickState={props.info.trickState}
					playerStates={props.info.playerStates}
					options={props.info.requiredAction.options} />
			)
		} else if (reqAction.startsWith("choose_")) {
			return (
				<Selection
					infoText={reqAction}
					options={props.info.requiredAction.options} />
			)
		}
	}
	return null
}
