const { getRandom } = require('@kmamal/domains/get-random')
const { accept: acceptHillClimbing } = require('./metaheuristics/hill-climbing')
const { create } = require('@kmamal/util/array/create')
const { map } = require('@kmamal/util/array/map')
const { uniform } = require('@kmamal/util/random/uniform')

const N = require('@kmamal/numbers/js')
const V = require('@kmamal/linear-algebra/vector').defineFor(N)

const init = async (
	{ domain, func },
	{ initial = {}, searchLine, accept, ...options } = {},
) => {
	const order = domain.length
	const solution = initial.solution ?? getRandom(domain)
	const value = initial.value ?? await func(solution)
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
		bestSearch: { gain: 0, i: -1 },
		startSolution: [ ...solution ],
		searchLine,
		accept: accept ?? acceptHillClimbing,
		index: -1,
		countFailed: 0,
		...options,
	}
}

const iter = async (state) => {
	const { order, solution, value, searchLine, accept } = state

	let index = state.index + 1
	if (index === order) {
		index = 0

		const { vectors, startSolution, bestSearch } = state
		if (bestSearch.i !== -1) {
			const newVector = V.sub.$$$(startSolution, solution)
			V.normalize.$$$(newVector)

			vectors[bestSearch.i] = vectors[0]
			vectors[0] = newVector
		}
		else {
			state.vectors.forEach((vector) => {
				map.$$$(vector, uniform)
				V.normalize.$$$(vector)
			})
		}

		bestSearch.gain = 0
		bestSearch.i = -1
		state.startSolution = [ ...solution ]
		state.startValue = value
	}
	state.index = index

	const { x, fx: candidateValue } = await searchLine(state)

	if (accept(state, candidateValue)) {
		const gain = state.startValue - candidateValue
		if (gain > state.bestSearch.gain) {
			state.bestSearch.gain = gain
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
