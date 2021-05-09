import { useMutation } from "@apollo/client";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Mark, Slider } from "@material-ui/core";
import { RecordVoiceOver as RecordVoiceOverIcon } from "@material-ui/icons";
import gql from "graphql-tag";
import { useMemo, useState } from "react";
import { RoundState, TrickState } from "../../types";
import { Loading } from "../../util";

interface Props {
	open: boolean
	onClose(): void
	roundState: RoundState
	trickState: TrickState
}

export default function TrickCalling(props: Props) {
	const [call, setCall] = useState(0)
	const info = useMemo(() => ({
		called: props.trickState.playerStates.reduce((prev, curr) => prev + (curr.tricksCalled ?? 0), 0),
		playersLeft: props.trickState.playerStates.reduce((prev, curr) => prev + (curr.tricksCalled == null ? 0 : 1), 0)
	}), [props.trickState])
	const marks = useMemo<Mark[]>(() => {
		// generate marks
		const marks = new Array(props.roundState.round + 1).fill(0).map((_, i) => ({ value: i, label: String(i) }))
		// filter invalid option if last user
		if (info.playersLeft === 1) {
			const limited = props.roundState.round - info.called
			if (limited > 0 && limited < marks.length) {
				delete marks[limited]
			}
		}
		return marks
	}, [props.roundState, info])
	const [callTricks] = useMutation(COMPLETE_ACTION)
	const [loading, setLoading] = useState(false)

	return (
		<>
			<Loading loading={loading} />

			<Dialog open={props.open}>
				<DialogTitle>Sage deine Stiche an</DialogTitle>

				<DialogContent>
					<DialogContentText>
						Es wurden {info.called} von <u><strong>{props.roundState.round}</strong></u> Stiche angesagt.<br />
						{info.playersLeft === 1 ? "Du bist die letzte ansagende Person." : `${info.playersLeft - 1} Spieler/-innen müssen nach Dir ansagen`}
					</DialogContentText>

					<Slider
						value={call}
						onChange={(_, x) => setCall(x as number)}
						valueLabelDisplay="off"
						marks={marks}
						step={null}
						min={0}
						max={props.roundState.round} />
				</DialogContent>

				<DialogActions>
					<Button
						onClick={async () => {
							setLoading(true)
							try {
								await callTricks({
									variables: {
										option: String(call)
									}
								})
							} finally {
								setLoading(false)
								props.onClose()
							}
						}}
						variant="contained"
						endIcon={<RecordVoiceOverIcon />}
						color="primary">
						Ansagen
				</Button>
				</DialogActions>
			</Dialog>
		</>
	)
}

const COMPLETE_ACTION = gql`
	mutation ($option: String!) {
		completeAction(option: $option)
	}
`
