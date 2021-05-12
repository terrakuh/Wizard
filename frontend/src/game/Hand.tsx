import { makeStyles } from "@material-ui/core";
import { PlayableCard } from "../types";
import Card from "./Card";

interface Props {
	cards: PlayableCard[]
}

export default function Hand(props: Props) {
	const classes = useStyles()

	const CARD_WIDTH = 179
	const CARD_HEIGHT = 280
	const WIDTH = 909 - CARD_HEIGHT
	const CUT_WIDTH = 100
	const step = WIDTH / (props.cards.length + 1)
	const foo = (x: number) => Math.sqrt(1 - Math.pow((x - WIDTH / 2) / (WIDTH / 2 + CUT_WIDTH), 2))

	return (
		<div className={classes.root}>
			{
				props.cards.map((card, index) => {
					const x = (index + 1) * step
					const y = foo(x)

					return <Card
						style={{
							position: "absolute",
							bottom: y * 150 - 200,
							left: x - CARD_WIDTH / 2 + CARD_HEIGHT / 2,
							transform: `rotate(${Math.PI / 2 * (1 - y) * (index < props.cards.length / 2 ? -1 : 1)}rad)`,
							filter: card.playable ? undefined : "brightness(30%)"
						}}
						key={card.id}
						src={`/cards/${card.id}.jpg`} />
				}
				)
			}
		</div>
	)
}

const useStyles = makeStyles({
	root: {
		position: "relative",
		height: 600,
		// backgroundColor: "white",
		overflow: "hidden"
	}
})
