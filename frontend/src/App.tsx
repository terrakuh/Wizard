import React from "react"
import { AppBar, createStyles, IconButton, Theme, Toolbar, Typography, withStyles, WithStyles } from "@material-ui/core"
import { Redirect, Route, Switch } from "react-router-dom"
import { Lobby } from "./lobby"
import Board from "./board/Board"
import TrickCallDialog from "./board/TrickCallDialog"
import Deck from "./board/Deck"
import Hand from "./board/Hand"
import { SettingsDialog } from "./settings"
import { Settings as SettingsIcon } from "@material-ui/icons"

function App(props: WithStyles<typeof styles>) {
	const [openSettings, setOpenSettings] = React.useState(false)
	return (
		<div className={props.classes.root}>
			<AppBar position="static">
				<Toolbar>
					<Typography
						className={props.classes.title}
						variant="h6"
						color="inherit">
						Wizard Online
					</Typography>
					<IconButton color="inherit" onClick={() => setOpenSettings(true)}>
						<SettingsIcon />
					</IconButton>
				</Toolbar>
			</AppBar>

			<SettingsDialog open={openSettings} onClose={() => setOpenSettings(false)} />

			<div className={props.classes.content}>
				<Switch>
					<Route path="/lobby/:id"><Lobby /></Route>
					<Route path="/lobby"><Lobby /></Route>
					<Route exact path="/game"><Board /></Route>
					<Route exact path="/test">
						<SettingsDialog open={true} onClose={() => console.log("hi")} />
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
	},
	title: {
		flexGrow: 1
	}
})

export default withStyles(styles)(App)
