import { useMutation } from "@apollo/client";
import { DialogContentText, GridList, makeStyles } from "@material-ui/core";
import gql from "graphql-tag";
import { useMemo, useState } from "react";
import { Loading } from "../../util";
import DialogTemplate from "./DialogTemplate";
import SelectCard from "./SelectCard";

function getOptionElements(options: OptionDict, updateSelection: (s: string) => void): JSX.Element[]{
    return Object.keys(options).map(option => <SelectCard key={option} card={option} selected={options[option]} onClick={updateSelection} />
    )
}

interface OptionDict {
	[key: string]: boolean
}

interface Props {
    infoText: string
    options: string[]
    onClose(): void
    open: boolean
}

export default function Selection(props: Props) {
    const [selection, setSelection] = useState(props.options[0])
	const [options, setOptions] = useState(props.options.reduce<OptionDict>((dict, value) => { dict[value] = false; return dict; }, {}))

	const updateSelection = (s: string) => {
		options[selection] = false
		options[s] = true
		setSelection(s)
		setOptions(options)
	}
	// const info = useMemo(() => ({
	// 	called: props.trickState.playerStates.reduce((prev, curr) => prev + (curr.tricksCalled ?? 0), 0),
	// 	playersLeft: props.trickState.playerStates.reduce((prev, curr) => prev + (curr.tricksCalled == null ? 1 : 0), 0)
	// }), [props.trickState])
	const [selectOption] = useMutation(COMPLETE_ACTION)
	const [loading, setLoading] = useState(false)

	const classes = useStyles();

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

				<div className={classes.root}>
					<GridList className={classes.gridList}>
						{getOptionElements(options, updateSelection)}
					</GridList>
				</div>

			</DialogTemplate>
		</>
	)
}

const useStyles = makeStyles((theme) => ({
	root: {
	  display: 'flex',
	  flexWrap: 'wrap',
	  justifyContent: 'space-around',
	  overflow: 'hidden',
	  backgroundColor: theme.palette.background.paper,
	},
	gridList: {
	  flexWrap: 'nowrap',
	  // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
	  transform: 'translateZ(0)',
	}
  }));

const COMPLETE_ACTION = gql`
	mutation ($option: String!) {
		completeAction(option: $option)
	}
`