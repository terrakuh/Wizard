import { ListItem, ListItemIcon, ListItemText, MenuItem } from "@material-ui/core"
import { ChevronRight as ChevronRightIcon } from "@material-ui/icons"
import { ReactNode } from "react"

interface Props {
	title: string
	subtitle?: string
	icon: ReactNode
	onClick(): void
	action?: ReactNode
}

export default function Item(props: Props) {
	return (
		<MenuItem button onClick={props.onClick}>
			<ListItemIcon>
				{props.icon}
			</ListItemIcon>
			<ListItemText primary={props.title} secondary={props.subtitle} />
			{props.action}
		</MenuItem>
	)
}
