import deLocale from "date-fns/locale/de"
import { format, addMinutes, subMinutes } from "date-fns"
import parseISO from "date-fns/parseISO"

const FORMAT = "yyyy-MM-dd'T'HH:mm:00"

export const PRETTY_FORMAT = "dd. MMMM 'um' HH:mm 'Uhr'"

export const fromDate = (date: Date) => format(addMinutes(date, date.getTimezoneOffset()), FORMAT)

export const toPrettyDate = (date: string) => {
	const x = parseISO(date)
	return format(subMinutes(x, x.getTimezoneOffset()), PRETTY_FORMAT, { locale: deLocale })
}
