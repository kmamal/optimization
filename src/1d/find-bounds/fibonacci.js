const { dimensionContains } = require('../../domain/contains')
const { dimensionClamp } = require('../../domain/clamp')
const { init: initBounded } = require('../bounded/fibonacci')

const { defineFor } = require('../../../fib')
const N = require('../../../domains/number')
const fib = defineFor(N)

const init = async (problem, a, fa, step) => {
	const { dimension, func } = problem

	const c = a + step
	if (!dimensionContains(dimension, c)) {
		return initBounded(problem, a, dimensionClamp(dimension, c))
	}

	const fc = await func(c)
	if (fc > fa) {
		const state = initBounded(problem, a, c)
		return state
	}

	const sign = Math.sign(step)
	return { dimension, func, a, fa, c, fc, index: 1, sign }
}

const expand = async (state) => {
	const { dimension, func, c, fc, index, sign } = state

	const nextIndex = index + 1
	const step = sign * fib(nextIndex)
	const b = c + step
	const fb = await func(b)

	if (!dimensionContains(dimension, b)) {
		state.b = dimensionClamp(dimension, b)
		state.fb = fb
		const prevStep = sign * fib(index)
		state.c = state.a + prevStep
		state.d = state.a + step
		const [ _fc, fd ] = await Promise.all([
			func(state.c),
			func(state.d),
		])
		state.fc = _fc
		state.fd = fd
		state.ci = index
		state.di = nextIndex
		return
	}

	if (fb > fc) {
		state.b = b
		state.fb = fb
		state.d = state.a + step
		state.fd = await func(state.d)
		state.ci = index
		state.di = nextIndex
		return
	}

	state.a = c
	state.fa = fc
	state.c = b
	state.fc = fb
	state.index = nextIndex
}

module.exports = {
	init,
	expand,
}
