import React from "react"
import { AppBar, createStyles, IconButton, Theme, Toolbar, Typography, withStyles, WithStyles } from "@material-ui/core"
import { Redirect, Route, Switch } from "react-router-dom"
import { SettingsDialog } from "./settings"
import { Settings as SettingsIcon } from "@material-ui/icons"
import RequiresLogin from "./util/RequiresLogin"
import { Login, Register } from "./login"
import Lobby from "./lobby"

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

			<SettingsDialog
				open={openSettings}
				onClose={() => setOpenSettings(false)} />

			<div className={props.classes.content}>
				<Switch>
					<Route path="/login">
						<Login />
					</Route>

					<Route path="/register/:token">
						<Register />
					</Route>
					<Route path="/register">
						<Register />
					</Route>

					<RequiresLogin path="/lobby/:code">
						<Lobby />
					</RequiresLogin>
					<RequiresLogin path="/lobby">
						<Lobby />
					</RequiresLogin>

					{/* <Route exact path="/game"><Board /></Route>
					<Route exact path="/test">
						<SettingsDialog open={true} onClose={() => console.log("hi")} />
					</Route> */}
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
