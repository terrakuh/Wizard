import { useMutation } from "@apollo/client";
import { DialogContentText, FormControlLabel, Radio, RadioGroup } from "@material-ui/core";
import gql from "graphql-tag";
import { useMemo, useState } from "react";
import { Loading } from "../../util";
import { cardStyle } from "../card/styles";
import DialogTemplate from "./DialogTemplate";

function getOptionElements(options: string[]): JSX.Element[]{
    return options.map(option => <div>
            <img
                style={cardStyle}
                alt=""
                src={`/private/${option}.jpg`} />
            <Radio value={option} />
        </div>
    )
}

interface Props {
    infoText: string
    options: string[]
    onClose(): void
    open: boolean
}

export default function Selection(props: Props) {
    const [selection, setSelection] = useState(props.options[0])
	// const info = useMemo(() => ({
	// 	called: props.trickState.playerStates.reduce((prev, curr) => prev + (curr.tricksCalled ?? 0), 0),
	// 	playersLeft: props.trickState.playerStates.reduce((prev, curr) => prev + (curr.tricksCalled == null ? 1 : 0), 0)
	// }), [props.trickState])
	const [selectOption] = useMutation(COMPLETE_ACTION)
	const [loading, setLoading] = useState(false)

	return (
		<>
			<Loading loading={loading} />

			<DialogTemplate
				title="Wähle aus"
				onCommit={async () => {
					setLoading(true)
					try {
						await selectOption({
							variables: {
								option: String(selection)
							}
						})
					} finally {
						setLoading(false)
						props.onClose()
					}
				}}
				open={props.open}>
				<DialogContentText>
					{props.infoText}
				</DialogContentText>

				<RadioGroup row
                    value={selection}
                    onChange={(_, x) => setSelection(x)}
                >
                    {getOptionElements(props.options)}
                </RadioGroup>
			</DialogTemplate>
		</>
	)
}

const COMPLETE_ACTION = gql`
	mutation ($option: String!) {
		completeAction(option: $option)
	}
`