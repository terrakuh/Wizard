import { useMutation, useQuery } from "@apollo/client"
import { Fab, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, makeStyles } from "@material-ui/core"
import { Add as AddIcon, PersonAdd as PersonAddIcon, PersonAddDisabled as PersonAddDisabledIcon } from "@material-ui/icons"
import gql from "graphql-tag"
import { useSnackbar } from "notistack"
import { useState } from "react"
import { Appointment } from "../types"
import { useWhoami } from "../util"
import NewAppointment from "./NewAppointment"
import { toPrettyDate } from "./util"

export default function Appointments() {
	const classes = useStyles()
	const { enqueueSnackbar } = useSnackbar()
	const { data } = useQuery<AppointmentsResult>(APPOINTMENTS, { pollInterval: 1000 })
	const [joinAppointment] = useMutation<any, JoinAppointmentVariables>(JOIN_APPOINTMENT)
	const [leaveAppointment] = useMutation<any, LeaveAppointmentVariables>(LEAVE_APPOINTMENT)
	const { user } = useWhoami()
	const [open, setOpen] = useState(false)

	return (
		<div>
			<List>
				{
					data?.appointments.map(appointment =>
						<ListItem key={appointment.id} button>
							<ListItemText
								primary={appointment.participants.map(p => p.name).join(", ")}
								primaryTypographyProps={{ color: "textPrimary" }}
								secondary={toPrettyDate(appointment.start)} />

							<ListItemSecondaryAction>
								<IconButton
									onClick={async () => {
										try {
											if (appointment.participants.find(p => p.id === user?.id)) {
												await leaveAppointment({ variables: { id: appointment.id } })
											} else {
												await joinAppointment({ variables: { id: appointment.id } })
											}
										} catch (err) {
											console.error(err)
											enqueueSnackbar("Aktion konnte nicht durchgeführt werden.", { variant: "error" })
										}
									}}>
									{
										appointment.participants.find(p => p.id === user?.id) ?
											<PersonAddDisabledIcon /> :
											<PersonAddIcon />
									}
								</IconButton>
							</ListItemSecondaryAction>
						</ListItem>
					)
				}
			</List>

			<Fab color="primary" className={classes.fab} onClick={() => setOpen(true)}>
				<AddIcon />
			</Fab>

			<NewAppointment open={open} onClose={() => setOpen(false)} />
		</div>
	)
}

const useStyles = makeStyles(theme => ({
	fab: {
		position: "absolute",
		bottom: theme.spacing(2),
		right: theme.spacing(2)
	}
}))

interface AppointmentsResult {
	appointments: Appointment[]
}

const APPOINTMENTS = gql`
	query {
		appointments {
			id
			start
			participants {
				id
				name
			}
		}
	}
`

interface LeaveAppointmentVariables {
	id: number
}

const LEAVE_APPOINTMENT = gql`
	mutation ($id: ID!) {
		leaveAppointment(id: $id) {
			id
			start
			participants {
				id
				name
			}
		}
	}
`

interface JoinAppointmentVariables {
	id: number
}

const JOIN_APPOINTMENT = gql`
	mutation ($id: ID!) {
		joinAppointment(id: $id) {
			id
			start
			participants {
				id
				name
			}
		}
	}
`
