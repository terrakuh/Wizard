import { useEffect } from "react"
import { RequiredAction, RoundState, TrickState } from "../../types"
import TrickCalling from "./TrickCalling"
import useNotification from "../../settings/useNotification"

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

	switch (props.info?.requiredAction.type) {
		case "call_tricks": return (
			<TrickCalling
				open={true}
				roundState={props.info.roundState}
				trickState={props.info.trickState}
				options={props.info.requiredAction.options}
				onClose={() => { }} />
		)
		default: return null
	}
}
