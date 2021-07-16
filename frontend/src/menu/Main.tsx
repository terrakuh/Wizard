import { useApolloClient, useMutation } from "@apollo/client"
import { Divider, List } from "@material-ui/core"
import { Brightness2 as Brightness2Icon, BrightnessHigh as BrightnessHighIcon, ChevronRight as ChevronRightIcon, Event as EventIcon, ExitToApp as ExitToAppIcon, GitHub as GitHubIcon, LockOpen as LockOpenIcon, Notifications as NotificationsIcon, PersonAdd as PersonAddIcon } from "@material-ui/icons"
import gql from "graphql-tag"
import { useState, CSSProperties, useEffect } from "react"
import { useHistory } from "react-router"
import useResizeObserver from "use-resize-observer"
import { useSettings } from "../settings"
import { useWhoami } from "../util"
import GameSection from "./GameSection"
import Item from "./Item"
import { MenuType } from "./menus"


interface Props {
	navigate(menu: MenuType): void
	style?: CSSProperties
	onResize(height: number | undefined): void
	onClose(): void
}

export default function Main(props: Props) {
	const history = useHistory()
	const { settings, setSettings } = useSettings()
	const { isLoggedIn } = useWhoami()
	const client = useApolloClient()
	const [logout] = useMutation(LOGOUT)
	const { ref } = useResizeObserver({
		onResize: ({ height }) => props.onResize(height)
	})
	const [version, setVersion] = useState<string>()

	// get version number
	useEffect(() => {
		fetch("/VERSION.txt")
			.then(resp => {
				if (resp.status !== 200 || !resp.headers.get("content-type")?.startsWith("text/plain")) {
					throw Error()
				}
				return resp.text()
			})
			.then(setVersion)
			.catch(() => { })
	}, [])

	return (
		<div style={props.style} ref={ref}>
			<List>
				<Item
					onClick={() => window.open("https://github.com/terrakuh/wizard", "_blank", "noreferrer")}
					icon={<GitHubIcon />}
					title="Repository"
					subtitle={version} />

				<Divider />

				{
					isLoggedIn ?
						<>
							<Item
								onClick={() => {
									history.push("/calendar")
									props.onClose()
								}}
								icon={<EventIcon />}
								title="Kalendar" />

							<GameSection onClose={props.onClose} />
						</> :
						<>
							<Item
								onClick={() => {
									history.push("/login")
									props.onClose()
								}}
								icon={<LockOpenIcon />}
								title="Anmelden" />

							<Item
								onClick={() => {
									history.push("/register")
									props.onClose()
								}}
								icon={<PersonAddIcon />}
								title="Registrieren" />
						</>
				}

				<Divider />

				<Item
					onClick={() => setSettings({
						...settings,
						theme: settings.theme === "dark" ? "light" : "dark"
					})}
					icon={settings.theme === "dark" ? <BrightnessHighIcon /> : <Brightness2Icon />}
					title={settings.theme === "dark" ? "Helles Design" : "Dunkles Design"} />

				{
					!isLoggedIn ? null :
						<>
							<Item
								onClick={() => props.navigate("notifications")}
								icon={<NotificationsIcon />}
								action={<ChevronRightIcon />}
								title="Benachrichtigungen" />

							<Divider />

							<Item
								onClick={async () => {
									try {
										await logout()
										await client.resetStore()
									} catch (err) {
										console.error(err)
									}
									history.push("/")
									props.onClose()
								}}
								icon={<ExitToAppIcon />}
								title="Abmelden" />
						</>
				}
			</List>
		</div>
	)
}

const LOGOUT = gql`
	mutation {
		logout
	}
`
