import React from "react"
import { Button, makeStyles, Paper, TextField } from "@material-ui/core"
import gql from "graphql-tag"
import { useLazyQuery, useMutation } from "@apollo/client"
import { Loading } from "../util"
import CryptoJS from "crypto-js"
import { useSnackbar } from "notistack"

export default function Login() {
	const { enqueueSnackbar } = useSnackbar()
	const [loggingIn, setLogginIn] = React.useState(false)
	const [name, setName] = React.useState("")
	const [password, setPassword] = React.useState("")
	const [login] = useMutation(LOGIN)
	const [fetchLoginInformation, { loading }] = useLazyQuery<GetLoginInformation>(GET_LOGIN_INFORMATION, {
		onCompleted(data) {
			if (data.loginInformation.hashType.toLowerCase() !== "sha512") {
				enqueueSnackbar(`Nicht unterstützte Hashfunktion "${data.loginInformation.hashType}"`, { variant: "error" })
				return
			}
			setLogginIn(true)
			const passwordHash = CryptoJS.PBKDF2(password, CryptoJS.enc.Base64.parse(data.loginInformation.salt), {
				iterations: 1,
				hasher: CryptoJS.algo.SHA512,
				keySize: 256 / 32
			})
			console.log(CryptoJS.enc.Base64.stringify(passwordHash))

			login({
				variables: {
					name,
					passwordHash: CryptoJS.enc.Base64.stringify(passwordHash)
				}
			})
				.then(() => enqueueSnackbar("Erfolgreich eingeloggt", { variant: "success" }))
				.catch(err => enqueueSnackbar(`Login fehlgeschlagen: ${err}`, { variant: "error" }))
				.finally(() => setLogginIn(false))
		},
		onError(err) {
			console.error(err)
			enqueueSnackbar("Login Informationen sind nicht verfügbar.", { variant: "error" })
		}
	})

	return (
		<Paper>
			<Loading loading={loading || loggingIn} />

			<TextField
				label="Benutzer"
				value={name}
				onChange={ev => setName(ev.target.value)}
				fullWidth />

			<TextField
				label="Passwort"
				value={password}
				type="password"
				onChange={ev => setPassword(ev.target.value)}
				fullWidth />

			<Button
				disabled={name === "" || password === ""}
				onClick={() => fetchLoginInformation({ variables: { name } })}
				variant="contained"
				color="primary">
				Einloggen
			</Button>
		</Paper>
	)
}

const useStyles = makeStyles({

})

interface GetLoginInformation {
	loginInformation: {
		salt: string
		hashType: string
	}
}

const GET_LOGIN_INFORMATION = gql`
	query ($name: String!) {
		loginInformation(name: $name) {
			salt
			hashType
		}
	}
`

const LOGIN = gql`
	mutation ($name: String!, $passwordHash: String!) {
		login(name: $name, passwordHash: $passwordHash) {
			id
			name
		}
	}
`
