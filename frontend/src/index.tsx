import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
import App from "./App"
import * as serviceWorkerRegistration from "./serviceWorkerRegistration"
import reportWebVitals from "./reportWebVitals"
import { BrowserRouter } from "react-router-dom"
import { IconButton } from "@material-ui/core"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { SnackbarProvider } from "notistack"
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client"
import { Cancel as CancelIcon } from "@material-ui/icons"
import { SettingsProvider } from "./settings"
import { ThemeParkProvider } from "./theme"

const client = new ApolloClient({
	cache: new InMemoryCache(),
	defaultOptions: {
		watchQuery: {
			fetchPolicy: "no-cache",
			errorPolicy: "ignore",
		},
		query: {
			fetchPolicy: "no-cache",
			errorPolicy: "all",
		},
	},
	uri: "/api/gql"
})

const notistackRef = React.createRef<SnackbarProvider>()

ReactDOM.render(
	<React.Fragment>
		<ApolloProvider client={client}>
			<BrowserRouter>
				<SettingsProvider>
					<ThemeParkProvider>
						<SnackbarProvider
							ref={notistackRef}
							preventDuplicate
							action={key => (
								<IconButton size="small" onClick={() => notistackRef.current?.closeSnackbar(key)}>
									<CancelIcon />
								</IconButton>
							)}>
							<DndProvider backend={HTML5Backend}>
								<App />
							</DndProvider>
						</SnackbarProvider>
					</ThemeParkProvider>
				</SettingsProvider>
			</BrowserRouter>
		</ApolloProvider>
	</React.Fragment>,
	document.getElementById("root")
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister()

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
