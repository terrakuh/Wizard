import { Divider, List } from "@material-ui/core"
import { ArrowBack as ArrowBackIcon, Check as CheckIcon, MusicNote as MusicNoteIcon, VolumeOff as VolumeOffIcon } from "@material-ui/icons"
import { CSSProperties } from "react"
import useResizeObserver from "use-resize-observer"
import { AudioTrack, notificationSpriteMap, useNotification, useSettings } from "../settings"
import Item from "./Item"
import { MenuType } from "./menus"


interface Props {
	navigate(menu: MenuType): void
	style?: CSSProperties
	onResize(height: number | undefined): void
}

export default function Notifications(props: Props) {
	const { settings, setSettings } = useSettings()
	const { ref } = useResizeObserver({ onResize: ({ height }) => props.onResize(height) })
	const notify = useNotification()

	return (
		<div style={props.style} ref={ref}>
			<List>
				<Item
					onClick={() => props.navigate("main")}
					icon={<ArrowBackIcon />}
					title="Zurück" />

				<Divider />

				<Item
					onClick={() => setSettings({
						...settings,
						notifications: {
							...settings.notifications,
							audioTrack: null
						}
					})}
					icon={<VolumeOffIcon />}
					action={settings.notifications.audioTrack == null ? <CheckIcon /> : null}
					title="Lautlos" />

				{
					Object.keys(notificationSpriteMap).map(track =>
						<Item
							key={track}
							onClick={() => {
								setSettings({
									...settings,
									notifications: {
										...settings.notifications,
										audioTrack: track as AudioTrack
									}
								})
								notify("Dies ist eine Test-Benachrichtigung.", track as AudioTrack)
							}}
							icon={<MusicNoteIcon />}
							action={settings.notifications.audioTrack === track ? <CheckIcon /> : null}
							title={track} />
					)
				}
			</List>
		</div>
	)
}
