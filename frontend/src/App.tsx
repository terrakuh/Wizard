import React from "react"
import { AppBar, IconButton, makeStyles, Theme, Toolbar, Typography } from "@material-ui/core"
import { Redirect, Route, Switch } from "react-router-dom"
import { SettingsDialog } from "./settings"
import { Settings as SettingsIcon } from "@material-ui/icons"
import RequiresLogin from "./util/RequiresLogin"
import { Login, Register } from "./login"
import Lobby from "./lobby"
import Game from "./game"
import Deck from "./game/Deck"

export default function App() {
	const classes = useStyles()
	const [openSettings, setOpenSettings] = React.useState(false)

	return (
		<div className={classes.root}>
			<AppBar position="static">
				<Toolbar>
					<Typography
						className={classes.title}
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

			<div className={classes.content}>
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

					<RequiresLogin path="/game">
						<Game />
					</RequiresLogin>

					<Route exact path="/test">

					</Route>

					<Route path="/"><Redirect to="/lobby" /></Route>
				</Switch>
			</div>
		</div>
	)
}

const useStyles = makeStyles((theme: Theme) => ({
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
}))
