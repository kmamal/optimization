const { getRandom } = require('./domain/get-random')
const { fromFactory } = require('@kmamal/util/array/from-factory')

const init = async (
	{ func, order, domain },
	{ initial = {}, search, makeAcquisitionFunc, ...options } = {},
) => {
	const points = initial.points ?? []
	if (initial.solution) {
		const solution = initial.solution
		const value = await func(...solution)
		points.push({ solution, value })
	}
	if (points.length < 2) {
		const remaining = 2 - points.length
		points.push(...await Promise.all(fromFactory(
			remaining,
			async () => {
				const solution = getRandom(domain)
				const value = await func(...solution)
				return { solution, value }
			},
		)))
	}

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
		search,
		makeAcquisitionFunc,
		...options,
	}
}

const iter = async (state) => {
	const {
		func,
		points,
		bestValue,
		makeAcquisitionFunc,
		search,
	} = state

	const acquisitionFunc = makeAcquisitionFunc(points)
	const candidate = await search(acquisitionFunc)
	const candidateValue = await func(...candidate)

	if (candidateValue < bestValue) {
		state.bestValue = candidateValue
		state.bestIndex = points.length
	}

	points.push({
		solution: candidate,
		value: candidateValue,
	})
}

const best = (state) => state.points[state.bestIndex]

module.exports = {
	init,
	iter,
	best,
}
