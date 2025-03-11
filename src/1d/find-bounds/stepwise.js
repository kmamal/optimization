const { containsSingle } = require('@kmamal/domains/contains')
const { clampSingl } = require('@kmamal/domains/clamp')

const init = ({ variable, func }, a, fa, step) => ({
	variable,
	func,
	a,
	fa,
	step,
})

const expand = async (state) => {
	const { variable, func, a, fa, step } = state

	const b = a + step
	if (!containsSingle(variable, b)) {
		state.b = clampSingl(variable, b)
		state.fb = await func(b)
		return
	}

	const fb = await func(b)
	if (fb > fa) {
		state.b = b
		state.fb = fb
		return
	}

	state.a = b
	state.fa = fb
}

module.exports = {
	init,
	expand,
}
