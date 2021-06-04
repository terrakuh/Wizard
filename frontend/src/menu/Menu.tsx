import { Divider, List, Paper, makeStyles } from "@material-ui/core"
import { ArrowBack as ArrowBackIcon, Brightness2 as Brightness2Icon, BrightnessHigh as BrightnessHighIcon, Check as CheckIcon, ChevronRight as ChevronRightIcon, Event as EventIcon, ExitToApp as ExitToAppIcon, MusicNote as MusicNoteIcon, Notifications as NotificationsIcon, VolumeOff as VolumeOffIcon } from "@material-ui/icons"
import { useState, CSSProperties, useRef, useEffect } from "react"
import { useHistory } from "react-router"
import { Transition } from "react-transition-group"
import { useThemePark } from "../theme"
import Item from "./Item"

const primary: {
	[k: string]: CSSProperties
} = {
	entering: {
		transform: "translateX(-100%)",
		position: "absolute"
	},
	entered: {
		transform: "translateX(0%)"
	},
	exiting: {
		position: "absolute"
	},
	exited: {
		transform: "translateX(-100%)",
		position: "absolute"
	}
}

const secondary: {
	[k: string]: CSSProperties
} = {
	entering: {
		transform: "translateX(100%)"
	},
	entered: {
		transform: "translateX(0%)"
	},
	exited: {
		transform: "translateX(100%)",
		position: "absolute"
	}
}

export default function Menu() {
	const classes = useStyles()
	const [test, setTest] = useState(true)
	const history = useHistory()
	const ref = useRef<HTMLDivElement>(null)
	const [height, setHeight] = useState<number>()
	const { scheme, setScheme } = useThemePark()

	useEffect(() => {
		setHeight((ref.current?.firstChild as HTMLElement)?.offsetHeight)
	}, [])

	return (
		<Paper className={classes.root} ref={ref} style={{ height }}>
			<Transition
				in={test}
				onEnter={(el: HTMLElement) => setHeight(el.offsetHeight)}
				timeout={0}>
				{
					state =>
						<div style={{
							transition: "transform 250ms ease-in-out",
							width: "100%",
							...primary[state]
						}}>
							<List>
								<Item
									onClick={() => history.push("/calendar")}
									icon={<EventIcon />}
									title="Kalendar" />

								<Divider />

								<Item
									onClick={() => setScheme(scheme === "dark" ? "light" : "dark")}
									icon={scheme === "dark" ? <BrightnessHighIcon /> : <Brightness2Icon />}
									title={scheme === "dark" ? "Helles Design" : "Dunkles Design"} />

								<Item
									onClick={() => setTest(false)}
									icon={<NotificationsIcon />}
									action={<ChevronRightIcon />}
									title="Benachrichtigungen" />

								<Divider />

								<Item
									onClick={() => { }}
									icon={<ExitToAppIcon />}
									title="Abmelden" />
							</List>
						</div>
				}
			</Transition>

			<Transition
				in={!test}
				onEnter={(el: HTMLElement) => setHeight(el.offsetHeight)}
				timeout={0}>
				{
					state =>
						<div style={{
							width: "100%",
							transition: "transform 250ms ease-in-out",
							...secondary[state]
						}}>
							<List>
								<Item
									onClick={() => setTest(true)}
									icon={<ArrowBackIcon />}
									title="Zurück" />

								<Divider />
								
								<Item
									onClick={() => { }}
									icon={<VolumeOffIcon />}
									title="Lautlos" />

								<Item
									onClick={() => { }}
									icon={<MusicNoteIcon />}
									title="Klang 1" />

								<Item
									onClick={() => { }}
									icon={<MusicNoteIcon />}
									action={<CheckIcon />}
									title="Klang 2" />

								<Item
									onClick={() => { }}
									icon={<MusicNoteIcon />}
									title="Alarm" />
							</List>
						</div>
				}
			</Transition>
		</Paper>
	)
}

const useStyles = makeStyles({
	root: {
		width: 300,
		overflow: "hidden",
		position: "absolute",
		left: 300,
		transition: "height 200ms ease"
	}
})
