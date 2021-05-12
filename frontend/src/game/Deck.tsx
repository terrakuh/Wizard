import { useDrop } from "react-dnd"

export default function Deck() {
	const [{ isActive }, drop] = useDrop({
		accept: "card",
		collect: (monitor) => ({
			isActive: monitor.isOver() && monitor.canDrop()
		})
	})

	return (
		<div style={{ flexGrow: 1 }} ref={drop}>
			{isActive ? "Spiele die Karte." : "asdasd"}
		</div>
	)
}
