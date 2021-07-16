import { useQuery } from "@apollo/client"
import { WHOAMI, WhoAmIResult, WhoAmIVariables } from "../gql"

export default function useWhoami() {
	const { data } = useQuery<WhoAmIResult, WhoAmIVariables>(WHOAMI, {
		fetchPolicy: "cache-first"
	})

	return {
		isLoggedIn: data?.whoami != null,
		user: data?.whoami
	}
}
