import { useMutation } from "@apollo/client"
import gql from "graphql-tag"
import { useSnackbar } from "notistack"
import { useCallback } from "react"

export default function usePlayCard() {
	const { enqueueSnackbar } = useSnackbar()
	const [playCard] = useMutation<any, PlayCardVariables>(PLAY_CARD)

	return useCallback(async (id: string) => {
		try {
			const response = await playCard({ variables: { id } })
			if (response.errors) {
				throw response.errors
			}
		} catch (err) {
			console.error(err)
			enqueueSnackbar("Die Karte konnte nicht gespielt werden.", { variant: "error" })
		}
	}, [enqueueSnackbar, playCard])
}

interface PlayCardVariables {
	id: string
}

const PLAY_CARD = gql`
	mutation ($id: String!) {
		completeAction(option: $id)
	}
`
