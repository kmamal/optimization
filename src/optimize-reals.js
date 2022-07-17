const { getRandom } = require('./domain/get-random')

const {
	init: initNelderMead,
	iter: iterNelderMead,
	best: bestNelderMead,
} = require('./nelder-mead')

const init = (problem) => ({
	problem,
	initial: null,
})

const iter = async (state) => {
	if (state.nelderMead) {
		iterNelderMead(state.nelderMead)
		return
	}

	const { func, domain } = state.problem
	const solution = getRandom(domain)
	const value = await func(...solution)
	const point = { solution, value }

	if (!state.initial) {
		state.initial = point
		return
	}

	if (value !== state.initial.value) {
		if (value < state.initial.value) {
			state.initial = point
		}

		// eslint-disable-next-line require-atomic-updates
		state.nelderMead = await initNelderMead(
			state.problem,
			{ initial: state.initial },
		)
	}
}

const best = (state) => state.nelderMead
	? bestNelderMead(state.nelderMead)
	: state.initial

module.exports = {
	init,
	iter,
	best,
}
