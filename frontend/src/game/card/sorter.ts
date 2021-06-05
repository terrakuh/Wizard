import { PlayableCard } from "../../types"

export function sortByReference(cards: PlayableCard[], reference: PlayableCard[]) {
	const common = cards.filter(({ id }) => reference.find(card => card.id === id) != null)
	const uncommon = cards.filter(({ id }) => reference.find(card => card.id === id) == null)
	return [...common, ...uncommon]
}
