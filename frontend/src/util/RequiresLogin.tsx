import { useQuery } from "@apollo/client"
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
	useQuery<Whoami>(WHOAMI, {
		onCompleted(data) {
			setIsLoggedIn(data.whoami != null)
		}
	})

	return (
		<>
			<Loading loading={isLoggedIn === undefined} />
			<Route {...props}>
				{isLoggedIn == null ? null : isLoggedIn ? props.children : <Redirect to="/login" />}
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
