const { containsSingle } = require('@kmamal/domains/contains')
const { clampSingle } = require('@kmamal/domains/clamp')
const {
	PHI,
	INVPHI,
	INVPHI2,
	init: initBounded,
} = require('../bounded/golden-ratio')

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

	return { variable, func, a, fa, c, fc, step }
}

const expand = async (state) => {
	const { variable, func, c, fc, step } = state

	const nextStep = step * PHI
	const b = c + nextStep
	if (!containsSingle(variable, b)) {
		state.b = clampSingle(variable, b)
		const halfRange = (state.b / 2) - (state.a / 2)
		state.c = (state.a + INVPHI2 * halfRange) + INVPHI2 * halfRange
		state.d = (state.a + INVPHI * halfRange) + INVPHI * halfRange
		const [ _fc, fd ] = await Promise.all([
			func(state.c),
			func(state.d),
		])
		state.fc = _fc
		state.fd = fd
		return
	}

	const fb = await func(b)
	if (fb > fc) {
		state.b = b
		state.fb = fb
		state.d = state.a + INVPHI * (state.b - state.a)
		state.fd = await func(state.d)
		return
	}

	state.a = c
	state.fa = fc
	state.c = b
	state.fc = fb
	state.step = nextStep
}

module.exports = {
	init,
	expand,
}
