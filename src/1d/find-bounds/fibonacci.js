const { containsSingle } = require('@kmamal/domains/contains')
const { clampSingle } = require('@kmamal/domains/clamp')
const { init: initBounded } = require('../bounded/fibonacci')

const N = require('@kmamal/numbers/js')
const { fibonacci } = require('@kmamal/math/fibonacci').defineFor(N)

const init = async (problem, a, fa, step) => {
	const { variable, func } = problem

	const c = a + step
	if (!containsSingle(variable, c)) {
		return initBounded(problem, a, clampSingle(variable, c))
	}

	const fc = await func(c)
	if (fc > fa) {
		const state = initBounded(problem, a, c)
		return state
	}

	const sign = Math.sign(step)
	return { variable, func, a, fa, c, fc, index: 1, sign }
}

const expand = async (state) => {
	const { variable, func, c, fc, index, sign } = state

	const nextIndex = index + 1
	const step = sign * fibonacci(nextIndex)
	const b = c + step
	const fb = await func(b)

	if (!containsSingle(variable, b)) {
		state.b = clampSingle(variable, b)
		state.fb = fb
		const prevStep = sign * fibonacci(index)
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
