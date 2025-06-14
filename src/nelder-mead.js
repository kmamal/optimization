const { getRandom } = require('@kmamal/domains/get-random')
const { getHalfRanges } = require('@kmamal/domains/get-half-ranges')
const { contains } = require('@kmamal/domains/contains')
const { sortBy } = require('@kmamal/util/array/sort')

const N = require('@kmamal/numbers/js')
const V = require('@kmamal/linear-algebra/vector').defineFor(N)

const _getValue = (x) => x.value

const init = async (
	{ domain, func },
	{ initial = {}, ...options } = {},
) => {
	const order = domain.length
	let points = initial.points
	if (!points) {
		const simplexSize = order + 1
		points = new Array(simplexSize)

		const base = initial.solution ?? getRandom(domain)
		points[0] = {
			solution: base,
			value: initial.value ?? await func(base),
		}

		const ranges = getHalfRanges(domain)
		for (let i = 0; i < order; i++) {
			const x = base[i]
			const { from, to } = domain[i]
			const step = ranges[i]
			const solution = [ ...base ]
			solution[i] = x + Math.sign((to - x) - (x - from)) * step
			points[i + 1] = { solution }
		}

		await Promise.all(points.slice(1).map(async (e) => {
			e.value = await func(e.solution)
		}))
	}

	sortBy.$$$(points, _getValue)

	return {
		order,
		domain,
		func,
		points,
		centroid: new Array(order),
		reflectionCoefficient: 1,
		expansionCoefficient: 2,
		contractionCoefficient: 1 / 2,
		shrinkCoefficient: 1 / 2,
		...options,
	}
}

const iter = async (state) => {
	const {
		order,
		domain,
		func,
		points,
		centroid,
		reflectionCoefficient,
		expansionCoefficient,
		contractionCoefficient,
		shrinkCoefficient,
	} = state

	const simplexSize = order + 1

	const best = points[0]
	const worst = points[simplexSize - 1]
	const secondWorst = points[simplexSize - 2]

	centroid.fill(0)
	const factor = 1 / (simplexSize - 1)
	for (let i = 0; i < simplexSize - 1; i++) {
		V.add.$$$(centroid, V.scale(points[i].solution, factor))
	}
	const direction = V.sub(centroid, worst.solution)

	steps: {
		// Reflection
		const offset = V.scale(direction, reflectionCoefficient)
		const reflected = V.add.$$$(offset, centroid)
		let reflectedValue = Infinity

		if (contains(domain, reflected)) {
			reflectedValue = await func(reflected)
			if (reflectedValue < secondWorst?.value && reflectedValue >= best.value) {
				worst.solution = reflected
				worst.value = reflectedValue
				break steps
			}

			// Expansion
			if (reflectedValue < best.value) {
				const coefficient = reflectionCoefficient * expansionCoefficient
				const _offset = V.scale(direction, coefficient)
				const expanded = V.add.$$$(_offset, centroid)

				if (contains(domain, expanded)) {
					const expandedValue = await func(expanded)

					if (expandedValue < reflectedValue) {
						worst.solution = expanded
						worst.value = expandedValue
						break steps
					}
				}

				worst.solution = reflected
				worst.value = reflectedValue
				break steps
			}
		}

		// Contraction
		if (reflectedValue < worst.value) {
			const coefficient = reflectionCoefficient * contractionCoefficient
			const _offset = V.scale(direction, coefficient)
			const contracted = V.add.$$$(_offset, centroid)
			const contractedValue = await func(contracted)
			if (contractedValue < reflectedValue) {
				worst.solution = contracted
				worst.value = contractedValue
				break steps
			}
		}
		else {
			const _offset = V.scale(direction, -contractionCoefficient)
			const contracted = V.add.$$$(_offset, centroid)
			const contractedValue = await func(contracted)
			if (contractedValue < worst.value) {
				worst.solution = contracted
				worst.value = contractedValue
				break steps
			}
		}

		// Shrink
		await Promise.all(points.map(async (x, i) => {
			if (i === 0) { return }

			const coefficient = 1 - shrinkCoefficient
			const _direction = V.sub(best.solution, x.solution)
			const _offset = V.scale.$$$(_direction, coefficient)
			V.add.$$$(x.solution, _offset)
			x.value = await func(x.solution)
		}))
	}

	sortBy.$$$(points, _getValue)
}

const best = (state) => state.points[0]


const stopWhenPointsConvergeTo = (tolerance) =>
	(state) => {
		const { points: [ a, ...rest ] } = state
		const maxDistance = rest.reduce((acc, x) => {
			const distance = V.norm(V.sub(a.solution, x.solution))
			return Math.max(acc, distance)
		}, 0)
		return maxDistance < tolerance
	}


module.exports = {
	init,
	iter,
	best,
	stopWhenPointsConvergeTo,
}
