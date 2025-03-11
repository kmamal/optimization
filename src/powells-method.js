const { getRandom } = require('@kmamal/domains/get-random')
const { accept: acceptHillClimbing } = require('./metaheuristics/hill-climbing')
const { create } = require('@kmamal/util/array/create')
const { map } = require('@kmamal/util/array/map')

const N = require('@kmamal/numbers/js')
const V = require('@kmamal/linear-algebra/vector').defineFor(N)

const init = async (
	{ order, domain, func },
	{ initial = {}, searchLine, accept, ...options } = {},
) => {
	const solution = initial.solution ?? getRandom(domain)
	const value = initial.value ?? await func(...solution)
	return {
		order,
		domain,
		func,
		solution,
		value,
		vectors: create(order, (i) => {
			const v = new Array(order).fill(0)
			v[i] = 1
			return v
		}),
		bestSearch: { x: 0, i: -1 },
		startPosition: [ ...solution ],
		searchLine,
		accept: accept ?? acceptHillClimbing,
		index: -1,
		countFailed: 0,
		...options,
	}
}

const iter = async (state) => {
	const { order, solution, searchLine, accept } = state

	let index = state.index + 1
	if (index === order) {
		index = 0

		const { vectors, startPosition, bestSearch } = state
		if (bestSearch.i !== -1) {
			const newVector = V.sub.$$$(startPosition, solution)
			V.normalize.$$$(newVector)

			vectors[bestSearch.i] = vectors[0]
			vectors[0] = newVector
		}
		else {
			state.vectors.forEach((vector) => {
				map.$$$(vector, () => Math.random())
				V.normalize.$$$(vector)
			})
		}

		bestSearch.x = 0
		bestSearch.i = -1
		state.startPosition = [ ...solution ]
	}
	state.index = index

	const { x, fx: candidateValue } = await searchLine()

	if (accept(state, candidateValue)) {
		const absX = Math.abs(x)
		if (absX > state.bestSearch.x) {
			state.bestSearch.x = absX
			state.bestSearch.i = index
		}

		const vector = state.vectors[index]
		V.add.$$$(solution, V.scale(vector, x))
		state.value = candidateValue
		state.countFailed = 0
	}
	else {
		state.countFailed++
	}
}

const best = (state) => ({
	solution: state.solution,
	value: state.value,
})

module.exports = {
	init,
	iter,
	best,
}
