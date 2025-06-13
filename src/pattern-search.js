const { getRandom } = require('@kmamal/domains/get-random')
const { getHalfRanges } = require('@kmamal/domains/get-half-ranges')
const { clamp } = require('@kmamal/domains/clamp')

const { minBy } = require('@kmamal/util/array/min')
const { map } = require('@kmamal/util/array/map')
const { max } = require('@kmamal/util/array/max')
const { roundUp } = require('@kmamal/util/number/rounding')

const map$$$ = map.$$$

const N = require('@kmamal/numbers/js')
const V = require('@kmamal/linear-algebra/vector').defineFor(N)

const init = async (
	{ domain, func },
	{ initial = {}, vectors, ...options } = {},
) => {
	const solution = initial.solution ?? getRandom(domain)
	const value = initial.value ?? await func(solution)
	return {
		order: domain.length,
		domain,
		func,
		solution,
		value,
		vectors: vectors ?? makeVectorsFromNorms(getHalfRanges(domain)),
		countFailed: 0,
		...options,
	}
}

const _getValue = (x) => x.value

const iter = async (state) => {
	const { func, domain, solution, value, vectors } = state

	const candidatePoints = await Promise.all(vectors.map(async (vector) => {
		const candidate = V.add(solution, vector)
		clamp.$$$(domain, candidate)
		const candidateValue = await func(candidate)
		return {
			solution: candidate,
			value: candidateValue,
		}
	}))

	const bestPoint = minBy(candidatePoints, _getValue)

	if (bestPoint.value < value) {
		/* eslint-disable require-atomic-updates */
		state.solution = bestPoint.solution
		state.value = bestPoint.value
		state.countFailed = 0
		/* eslint-enable require-atomic-updates */
	}
	else {
		state.countFailed++
	}
}

const best = (state) => ({
	solution: state.solution,
	value: state.value,
})


const makeVectorsFromNorms = (norms) => {
	const order = norms.length
	const vectors = new Array(order * 2)
	let writeIndex = 0
	for (let i = 0; i < order; i++) {
		const vector1 = new Array(order).fill(0)
		vector1[i] = norms[i]
		vectors[writeIndex++] = vector1

		const vector2 = [ ...vector1 ]
		vector2[i] *= -1
		vectors[writeIndex++] = vector2
	}
	return vectors
}

const scaleVectors = (state, factor) => {
	const { vectors } = state
	for (let i = 0; i < vectors.length; i++) {
		V.scale.$$$(vectors[i], factor)
	}
}

const roundVectors = (state) => {
	const { vectors } = state
	for (let i = 0; i < vectors.length; i++) {
		map$$$(vectors[i], roundUp)
	}
}

const adjustVectors = (state, scaleForFailure, scaleForSuccess) => {
	scaleVectors(state, state.countFailed > 0 ? scaleForFailure : scaleForSuccess)
	state.countFailed = 0
}

const adjustVectorsRounded = (state, scaleForFailure, scaleForSuccess) => {
	adjustVectors(state, scaleForFailure, scaleForSuccess)
	roundVectors(state)
}

const getVectorNorms = (state) => map(state.vectors, V.norm)
const getMaxVectorNorm = (state) => max(getVectorNorms(state))

const didVectorsConvergeTo = (state, tolerance) =>
	getMaxVectorNorm(state) <= tolerance

const stopWhenVectorsConvergeTo = (tolerance) =>
	(state) => didVectorsConvergeTo(state, tolerance)

const didFailAndVectorsConvergeTo = (state, tolerance) =>
	state.countFailed > 0 && getMaxVectorNorm(state) <= tolerance

const stopWhenFailedAndVectorsConvergeTo = (tolerance) =>
	(state) => didFailAndVectorsConvergeTo(state, tolerance)


module.exports = {
	init,
	iter,
	best,
	makeVectorsFromNorms,
	scaleVectors,
	roundVectors,
	adjustVectors,
	adjustVectorsRounded,
	getVectorNorms,
	getMaxVectorNorm,
	didVectorsConvergeTo,
	stopWhenVectorsConvergeTo,
	didFailAndVectorsConvergeTo,
	stopWhenFailedAndVectorsConvergeTo,
}
