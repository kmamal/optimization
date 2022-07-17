const { getRandom } = require('./domain/get-random')
const { clamp } = require('./domain/clamp')
const { fromFactory } = require('@kmamal/util/array/from-factory')
const { rand } = require('@kmamal/util/random/rand')
const { random } = require('@kmamal/util/random/random')

const init = async (
	{ func, order, domain },
	{ initial = {}, ...options } = {},
) => {
	const points = initial.points ?? await Promise.all(fromFactory(
		Math.max(4, initial.count ?? 10 * order),
		async () => {
			const solution = getRandom(domain)
			const value = await func(...solution)
			return { solution, value }
		},
	))

	let bestIndex = -1
	let bestValue = Infinity
	for (let i = 0; i < points.length; i++) {
		const { value } = points[i]
		if (value < bestValue) {
			bestValue = value
			bestIndex = i
		}
	}

	return {
		order,
		domain,
		func,
		points,
		bestIndex,
		bestValue,
		candidate: new Array(order),
		crossoverProbability: 0.9,
		differentialWeight: 0.8,
		index: -1,
		countFailed: 0,
		...options,
	}
}

const iter = async (state) => {
	const {
		func,
		order,
		domain,
		points,
		candidate,
		crossoverProbability,
		differentialWeight,
	} = state

	const pointsLength = points.length
	const index = (state.index + 1) % pointsLength
	state.index = index

	const base = points[index]
	const x = base.solution
	const selected = new Set([ index ])
	do {
		selected.add(rand(pointsLength))
	} while (selected.size < 4)
	selected.delete(index)
	const [ a, b, c ] = Array
		.from(selected.values())
		.map((i) => points[i].solution)

	const dim = rand(order)
	for (let i = 0; i < order; i++) {
		candidate[i] = i === dim || random() < crossoverProbability
			? ((a[i] / 4) + differentialWeight * ((b[i] / 4) - (c[i] / 4))) * 4
			: x[i]
	}
	clamp.$$$(domain, candidate)

	const candidateValue = await func(...candidate)

	if (candidateValue <= base.value) {
		state.candidate = base.solution
		base.solution = candidate
		base.value = candidateValue

		if (candidateValue < state.bestValue) {
			state.bestValue = candidateValue
			state.bestIndex = index
		}

		state.countFailed = 0
	} else {
		state.countFailed++
	}
}

const best = (state) => state.points[state.bestIndex]

module.exports = {
	init,
	iter,
	best,
}
