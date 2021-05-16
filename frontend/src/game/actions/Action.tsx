import { useEffect } from "react"
import { RequiredAction, RoundState, TrickState } from "../../types"
import TrickCalling from "./TrickCalling"
import useNotification from "../../settings/useNotification"
import Selection from "./Selection"

interface Props {
	info: {
		requiredAction: RequiredAction
		roundState: RoundState
		trickState: TrickState
	} | null
}

export default function Action(props: Props) {
	const notify = useNotification()

	useEffect(() => {
		if (props.info?.requiredAction.type === "play_card") {
			notify("Du bist am Zug.")
		}
	}, [notify, props.info])

	if (props.info) {
		const reqAction = props.info?.requiredAction.type

		if (reqAction === "call_tricks") {
			return (<TrickCalling
				open={true}
				roundState={props.info.roundState}
				trickState={props.info.trickState}
				options={props.info.requiredAction.options}
				onClose={() => { }} />
			)
		} else if (reqAction.startsWith("choose_")) {
			return (
				<Selection
					infoText={reqAction}
					onClose={() => { }}
					open={true}
					options={props.info.requiredAction.options} />
			)
		}
	}
	return null
}
