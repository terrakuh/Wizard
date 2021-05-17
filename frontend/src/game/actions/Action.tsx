import { RequiredAction, RoundState, TrickState } from "../../types"
import TrickCalling from "./TrickCalling"
import Selection from "./Selection"

interface Props {
	info: {
		requiredAction: RequiredAction
		roundState: RoundState
		trickState: TrickState
	} | null
}

export default function Action(props: Props) {
	if (props.info) {
		const reqAction = props.info?.requiredAction.type

		if (reqAction === "call_tricks") {
			return (
				<TrickCalling
					roundState={props.info.roundState}
					trickState={props.info.trickState}
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
