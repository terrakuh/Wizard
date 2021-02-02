import React from "react"
import { AppBar, createStyles, Theme, Toolbar, Typography, withStyles, WithStyles } from "@material-ui/core"
import { Redirect, Route, Switch } from "react-router-dom"
import { Lobby } from "./lobby"
import Board from "./board/Board"
import TrickCallDialog from "./board/TrickCallDialog"
import Deck from "./board/Deck"
import Hand from "./board/Hand"

function App(props: WithStyles<typeof styles>) {
	return (
		<div className={props.classes.root}>
			<AppBar position="static">
				<Toolbar>
					<Typography variant="h6" color="textPrimary">Wizard Online</Typography>
				</Toolbar>
			</AppBar>

			<div className={props.classes.content}>
				<Switch>
					<Route path="/lobby/:id"><Lobby /></Route>
					<Route path="/lobby"><Lobby /></Route>
					<Route exact path="/game"><Board /></Route>
					<Route exact path="/test">
						<Deck 
						/>
					</Route>
					<Route path="/"><Redirect to="/lobby" /></Route>
				</Switch>
			</div>
		</div>
	)
}

const styles = (theme: Theme) => createStyles({
	root: {
		display: "flex",
		flexDirection: "column",
		width: "100%",
		height: "100%"
	},
	content: {
		backgroundColor: theme.palette.background.default,
		flexGrow: 1,
		padding: theme.spacing()
	}
})

export default withStyles(styles)(App)
