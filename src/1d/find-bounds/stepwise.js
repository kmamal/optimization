const { dimensionContains } = require('../../domain/contains')
const { dimensionClamp } = require('../../domain/clamp')

const init = ({ dimension, func }, a, fa, step) => ({
	dimension,
	func,
	a,
	fa,
	step,
})

const expand = async (state) => {
	const { dimension, func, a, fa, step } = state

	const b = a + step
	if (!dimensionContains(dimension, b)) {
		state.b = dimensionClamp(dimension, b)
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
