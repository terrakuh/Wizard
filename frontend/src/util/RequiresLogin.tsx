import { useQuery } from "@apollo/client"
import gql from "graphql-tag"
import React from "react"
import { Redirect, Route, RouteProps } from "react-router"
import { User } from "../types"

interface Props extends RouteProps {
	children?: React.ReactNode | null
}

export default function RequiresLogin(props: Props) {
	const [isLoggedIn, setIsLoggedIn] = React.useState(false)
	const { data, stopPolling } = useQuery<Whoami>(WHOAMI, {
		pollInterval: 1000
	})

	React.useEffect(() => {
		if (data?.whoami) {
			setIsLoggedIn(true)
			stopPolling()
		}
	}, [data, stopPolling])

	return (
		<Route>
			{isLoggedIn ? props.children : <Redirect to="/login" />}
		</Route>
	)
}

interface Whoami {
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
