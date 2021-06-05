import gql from "graphql-tag"
import { User } from "../types"

export type WhoAmIVariables = {}
export interface WhoAmIResult {
	whoami: User | null
}

export const WHOAMI = gql`
	query WhoAmI {
		whoami {
			id
			name
		}
	}
`
