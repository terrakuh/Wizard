import { Paper, makeStyles, Popover } from "@material-ui/core"
import { useState, CSSProperties, useEffect } from "react"
import { Transition } from "react-transition-group"
import Main from "./Main"
import Notifications from "./Notifications"
import { MenuType } from "./menus"


interface Props {
	open: boolean
	onClose(): void
	anchorEl: HTMLElement | null
}

export default function Menu(props: Props) {
	const classes = useStyles()
	const [menu, setMenu] = useState<MenuType>("main")
	const [height, setHeight] = useState<number>()

	// reset
	useEffect(() => {
		if (props.open) {
			setMenu("main")
		}
	}, [props.open])

	return (
		<Popover
			open={props.open}
			onClose={props.onClose}
			anchorEl={props.anchorEl}
			anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
			<Paper className={classes.root} style={{ height }}>
				<Transition
					in={menu === "main"}
					unmountOnExit
					timeout={250}>
					{
						state =>
							<Main
								navigate={setMenu}
								onResize={height => menu === "main" && setHeight(height)}
								onClose={props.onClose}
								style={{
									transition: "transform 250ms ease-in-out",
									width: "100%",
									...PRIMARY[state]
								}} />
					}
				</Transition>

				<Transition
					in={menu === "notifications"}
					unmountOnExit
					timeout={250}>
					{
						state =>
							<Notifications
								navigate={setMenu}
								onResize={height => menu === "notifications" && setHeight(height)}
								style={{
									width: "100%",
									transition: "transform 250ms ease-in-out",
									...SECONDARY[state]
								}} />
					}
				</Transition>
			</Paper>
		</Popover>
	)
}

const useStyles = makeStyles(theme => ({
	root: {
		width: 300,
		overflow: "hidden",
		transition: "height 200ms ease",
		position: "relative",
		"& .MuiDivider-root": {
			margin: theme.spacing(1)
		}
	}
}))


const PRIMARY: {
	[k: string]: CSSProperties
} = {
	entering: {
		transform: "translateX(0%)",
		position: "absolute"
	},
	entered: {
		transform: "translateX(0%)"
	},
	exiting: {
		transform: "translateX(-100%)",
		position: "absolute"
	},
	exited: {
		transform: "translateX(-100%)",
		position: "absolute"
	}
}

const SECONDARY: {
	[k: string]: CSSProperties
} = {
	entering: {
		transform: "translateX(0%)"
	},
	entered: {
		transform: "translateX(0%)"
	},
	exiting: {
		transform: "translateX(100%)",
		position: "absolute"
	},
	exited: {
		transform: "translateX(100%)",
		position: "absolute"
	}
}
