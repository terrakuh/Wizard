import { DialogContentText, Slider } from "@material-ui/core"
import { useMemo, useState } from "react"
import { RoundState, TrickState } from "../../types"
import DialogTemplate from "./DialogTemplate"

interface Props {
	roundState: RoundState
	trickState: TrickState
	options: string[]
}

export default function TrickCalling(props: Props) {
	const [call, setCall] = useState(0)
	const info = useMemo(() => ({
		called: props.trickState.playerStates.reduce((prev, curr) => prev + (curr.tricksCalled ?? 0), 0),
		playersLeft: props.trickState.playerStates.reduce((prev, curr) => prev + (curr.tricksCalled == null ? 1 : 0), 0)
	}), [props.trickState])

	return (
		<DialogTemplate
			title="Sage deine Stiche an"
			canCommit={true}
			onCommit={() => ({ option: String(call) })}>
			<DialogContentText>
				Es wurden {info.called} von <u><strong>{props.roundState.round}</strong></u> Stiche angesagt.<br />
				{info.playersLeft === 1 ? "Du bist die letzte ansagende Person." : `${info.playersLeft - 1} Spieler/-innen müssen nach Dir ansagen`}
			</DialogContentText>

			<Slider
				value={call}
				onChange={(_, x) => setCall(x as number)}
				valueLabelDisplay="off"
				marks={props.options.map(option => ({ value: parseInt(option), label: option }))}
				step={null}
				min={0}
				max={props.roundState.round} />
		</DialogTemplate>
	)
}
