import { useMutation, useQuery } from "@apollo/client"
import { formatISO } from "date-fns"
import gql from "graphql-tag"
import { useCallback, useState } from "react"
import { Appointment } from "../types"
import { useWhoami } from "../util"


export default function useAppointmentAssistant() {
	const { user } = useWhoami()
	const { data, refetch } = useQuery<AppointmentsResult>(APPOINTMENTS, { pollInterval: 1000 })
	const [loading, setLoading] = useState(false)
	const [joinAppointment] = useMutation<any, JoinAppointmentVariables>(JOIN_APPOINTMENT)
	const [leaveAppointment] = useMutation<any, LeaveAppointmentVariables>(LEAVE_APPOINTMENT)
	const [createAppointment] = useMutation<any, CreateAppointmentVariables>(CREATE_APPOINTMENT)

	return {
		appointments: data?.appointments ?? [],
		loading,
		toggleAppointment: useCallback(async (appointment: Appointment) => {
			setLoading(true)
			try {
				if (appointment.participants.find(p => p.id === user?.id)) {
					await leaveAppointment({ variables: { id: appointment.id } })
				} else {
					await joinAppointment({ variables: { id: appointment.id } })
				}
				await refetch()
			} finally {
				setLoading(false)
			}
		}, [leaveAppointment, joinAppointment, user, refetch]),
		createAppointment: useCallback(async (start: Date, end: Date) => {
			setLoading(true)
			try {
				await createAppointment({
					variables: {
						start: formatISO(start),
						end: formatISO(end)
					}
				})
				await refetch()
			} finally {
				setLoading(false)
			}
		}, [createAppointment, refetch])
	}
}

interface AppointmentsResult {
	appointments: Appointment[]
}

const APPOINTMENTS = gql`
	query {
		appointments {
			id
			start
			end
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
		leaveAppointment(id: $id)
	}
`

interface JoinAppointmentVariables {
	id: number
}

const JOIN_APPOINTMENT = gql`
	mutation ($id: ID!) {
		joinAppointment(id: $id)
	}
`

interface CreateAppointmentVariables {
	start: string
	end: string
}

const CREATE_APPOINTMENT = gql`
	mutation ($start: String!, $end: String!) {
		createAppointment(start: $start, end: $end)
	}
`
