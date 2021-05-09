import { RequiredAction } from "../../types";

interface Props {
	action: RequiredAction
}

export default function Action(props: Props) {
	switch (props.action.type) {
		case "":
		default:
	}
}
