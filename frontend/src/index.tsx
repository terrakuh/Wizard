import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
import App from "./App"
import * as serviceWorkerRegistration from "./serviceWorkerRegistration"
import reportWebVitals from "./reportWebVitals"
import { BrowserRouter } from "react-router-dom"
import { createMuiTheme, IconButton, ThemeProvider } from "@material-ui/core"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { SnackbarProvider } from "notistack"
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client"
import { Cancel as CancelIcon } from "@material-ui/icons"
import { SettingsProvider } from "./settings"

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

const theme = createMuiTheme({
	palette: {
		type: "dark",
		background: {
			paper: "#303443",
			default: "#242733"
		},
		primary: {
			main: "#5BB14E"
		},
		secondary: {
			main: "#4E5BB1"
		}
	}
})

const notistackRef = React.createRef<SnackbarProvider>()

ReactDOM.render(
	<React.StrictMode>
		<ApolloProvider client={client}>
			<ThemeProvider theme={theme}>
				<BrowserRouter>
					<SettingsProvider>
						<SnackbarProvider
							ref={notistackRef}
							action={key => (
								<IconButton size="small" onClick={() => notistackRef.current?.closeSnackbar(key)}>
									<CancelIcon />
								</IconButton>
							)}>
							<DndProvider backend={HTML5Backend}>
								<App />
							</DndProvider>
						</SnackbarProvider>
					</SettingsProvider>
				</BrowserRouter>
			</ThemeProvider>
		</ApolloProvider>
	</React.StrictMode>,
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
