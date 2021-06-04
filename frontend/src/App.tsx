import { makeStyles } from "@material-ui/core"
import { Redirect, Route, Switch } from "react-router-dom"
import RequiresLogin from "./util/RequiresLogin"
import { Login, Register } from "./login"
import Lobby from "./lobby"
import Game from "./game"
import Deck from "./game/Deck"
import { PlayedCard } from "./game/card"
import Calendar from "./calendar"
import Navigation from "./Navigation"
import Hand from "./game/Hand"
import Menu from "./menu/Menu"

export default function App() {
	const classes = useStyles()

	return (
		<div className={classes.root}>
			<Navigation />

			<div className={classes.content}>
				<Switch>
					<RequiresLogin path="/login" invertedLogicPath="/">
						<Login />
					</RequiresLogin>

					<RequiresLogin path="/register/:token" invertedLogicPath="/">
						<Register />
					</RequiresLogin>
					<RequiresLogin path="/register" invertedLogicPath="/">
						<Register />
					</RequiresLogin>

					<RequiresLogin path="/lobby/:code">
						<Lobby />
					</RequiresLogin>
					<RequiresLogin path="/lobby">
						<Lobby />
					</RequiresLogin>

					<RequiresLogin path="/game">
						<Game />
					</RequiresLogin>

					<RequiresLogin path="/calendar">
						<Calendar />
					</RequiresLogin>

					<Route exact path="/test">
						<Deck cards={[
							{
								id: "green_9",
								isWinning: false,
								player: {
									id: 1,
									name: "Yunus"
								}
							},
							{
								id: "green_4",
								isWinning: false,
								player: {
									id: 1,
									name: "Yunus"
								}
							},
							{
								id: "blue_9",
								isWinning: false,
								player: {
									id: 1,
									name: "Yunus"
								}
							},
							{
								id: "red_9",
								isWinning: false,
								player: {
									id: 1,
									name: "Yunus"
								}
							}
						]} />
					</Route>

					<Route path="/test_hand">
						<Hand cards={[
							{
								id: "green_9",
								playable: false
							},
							{
								id: "blue_9",
								playable: true
							},
							{
								id: "red_9",
								playable: false
							},
							{
								id: "blue_wizard",
								playable: false
							},
							{
								id: "red_wizard",
								playable: false
							},
							{
								id: "yellow_wizard",
								playable: false
							},
							{
								id: "green_wizard",
								playable: false
							}
						]} />
					</Route>

					<Route path="/menu">
						<Menu />
					</Route>

					<Route path="/test1">
						<PlayedCard
							discoEffect="hue"
							size="small"
							card={{
								id: "green_9",
								isWinning: false,
								player: {
									id: 1,
									name: "Yunus"
								}
							}} />
					</Route>

					<Route path="/"><Redirect to="/lobby" /></Route>
				</Switch>
			</div>
		</div>
	)
}

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexDirection: "column",
		width: "100%",
		height: "100%"
	},
	content: {
		backgroundColor: theme.palette.background.default,
		flexGrow: 1,
		padding: theme.spacing(1),
		overflow: "hidden"
	}
}))
