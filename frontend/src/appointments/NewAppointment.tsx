import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@material-ui/core"
import { MuiPickersUtilsProvider, KeyboardDateTimePicker } from "@material-ui/pickers"
import { useState } from "react"
import DateFnsUtils from "@date-io/date-fns"
import deLocale from "date-fns/locale/de"
import { format } from "date-fns"
import gql from "graphql-tag"
import { useMutation } from "@apollo/client"
import { useSnackbar } from "notistack"
import { Loading } from "../util"

interface Props {
	open: boolean
	onClose(): void
}

export default function NewAppointment(props: Props) {
	const { enqueueSnackbar } = useSnackbar()
	const [date, setDate] = useState(new Date())
	const [createAppointment, { loading }] = useMutation<any, CreateAppointmentVariables>(CREATE_APPOINTMENT)

	return (
		<>
			<Dialog open={props.open} fullWidth>
				<DialogTitle>Neues Event</DialogTitle>

				<DialogContent>
					<MuiPickersUtilsProvider utils={DateFnsUtils} locale={deLocale}>
						<KeyboardDateTimePicker
							label="Zeit"
							fullWidth
							minutesStep={15}
							format="dd. MMMM 'um' HH:mm 'Uhr'"
							ampm={false}
							disablePast
							value={date}
							onChange={date => setDate(date as Date)} />
					</MuiPickersUtilsProvider>
				</DialogContent>

				<DialogActions>
					<Button color="secondary" onClick={props.onClose}>
						Abbrechen
					</Button>

					<Button
						onClick={async () => {
							try {
								await createAppointment({ variables: { start: format(date, "yyyy-MM-dd'T'HH:mm:00") } })
								props.onClose()
							} catch (err) {
								console.error(err)
								enqueueSnackbar("Das Event konnte nicht erstellt werden.", { variant: "error" })
							}
						}}
						color="primary"
						variant="contained">
						Erstellen
					</Button>
				</DialogActions>
			</Dialog>

			<Loading loading={loading} />
		</>
	)
}

interface CreateAppointmentVariables {
	start: string
}

const CREATE_APPOINTMENT = gql`
	mutation ($start: String!) {
		createAppointment(start: $start) {
			id
			start
			participants {
				id
				name
			}
		}
	}
`
