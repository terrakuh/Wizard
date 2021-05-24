import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay, parseISO } from "date-fns"
import { de, enUS } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { makeStyles } from "@material-ui/core"
import useAppointmentAssistant from "./useAppointmentAssistant"
import { useSnackbar } from "notistack"
import { Loading } from "../util"


const locales = {
	"de": de,
	"en-US": enUS
}

const localizer = dateFnsLocalizer({
	format,
	parse,
	startOfWeek,
	getDay,
	locales
})

export default function Calendar() {
	const classes = useStyles()
	const { enqueueSnackbar } = useSnackbar()
	const { toggleAppointment, appointments, createAppointment, loading } = useAppointmentAssistant()

	return (
		<div className={classes.root}>
			<Loading loading={loading} />

			<BigCalendar
				localizer={localizer}
				culture={navigator.language in locales ? navigator.language : "en-US"}
				views={["week", "day", "agenda"]}
				defaultView="week"
				selectable={true}
				onSelectSlot={async ({ start, end, action }) => {
					if (action === "select") {
						try {
							await createAppointment(start as Date, end as Date)
						} catch (err) {
							console.error(err)
							enqueueSnackbar("Event konnte nicht erstellt werden.", { variant: "error" })
						}
					}
				}}
				onDoubleClickEvent={async (appointment) => {
					try {
						await toggleAppointment(appointment)
					} catch (err) {
						console.error(err)
						enqueueSnackbar("Aktion konnte nicht durchgeführt werden.", { variant: "error" })
					}
				}}
				titleAccessor={appointment => appointment.participants.map(user => user.name).join(", ")}
				startAccessor={appointment => parseISO(appointment.start)}
				endAccessor={appointment => parseISO(appointment.end)}
				events={appointments} />
		</div>
	)
}

const useStyles = makeStyles({
	root: {
		height: "100%"
	}
})
