import { gql, useQuery } from "@apollo/client";
import { User } from "../types";

interface Options {
	pollInterval?: number
}

export default function useWhoami(options?: Options) {
	const { data } = useQuery<WhoamiResult>(WHOAMI, { pollInterval: options?.pollInterval })
	return {
		isLoggedIn: data?.whoami != null,
		user: data?.whoami
	}
}

interface WhoamiResult {
	whoami: User | null
}

const WHOAMI = gql`
	query {
		whoami {
			id
			name
		}
	}
`
