import { useLazyQuery, useQuery } from "@apollo/client"
import gql from "graphql-tag"
import React from "react"
import { Redirect, Route, RouteProps } from "react-router"
import { User } from "../types"
import Loading from "./Loading"

interface Props extends RouteProps {
	children?: React.ReactNode | null
}

export default function RequiresLogin(props: Props) {
	const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>()
	const { data, stopPolling, startPolling } = useQuery<Whoami>(WHOAMI)

	React.useEffect(() => {
		startPolling(1000)
		return stopPolling
	}, [startPolling, stopPolling])

	React.useEffect(() => {
		if (data?.whoami) {
			console.log("logged in")
			setIsLoggedIn(true)
			stopPolling()
		}
	}, [data, stopPolling])

	return (
		<>
			<Loading loading={isLoggedIn === undefined} />
			<Route {...props}>
				{isLoggedIn !== false ? props.children : <Redirect to="/login" />}
			</Route>
		</>
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
