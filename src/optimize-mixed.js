const { getRandom } = require('./domain/get-random')
const { map } = require('@kmamal/util/array/map')

const {
	init: initPatternSearch,
	iter: iterPatternSearch,
	best: bestPatternSearch,
} = require('./pattern-search')

const _round = (x) => Math.sign(x) * Math.ceil(Math.abs(x))

const init = (problem) => ({
	problem,
	initial: null,
})

const iter = async (state) => {
	if (state.patternSearch) {
		await iterPatternSearch(state.patternSearch)

		const { domain } = state
		if (state.patternSearch.countFailed) {
			state.patternSearch.vectors.forEach((vector) => {
				map.$$$(vector, (x, i) => {
					const y = x / 2
					return domain[i].type === 'int' ? _round(y) : y
				})
			})
		} else {
			state.patternSearch.vectors.forEach((vector) => {
				map.$$$(vector, (x, i) => {
					const y = x * 0.5
					return domain[i].type === 'int' ? _round(y) : y
				})
			})
		}
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
		state.patternSearch = await initPatternSearch(
			state.problem,
			{ initial: state.initial },
		)
		state.patternSearch.vectors.forEach((vector) => {
			map.$$$(vector, (x, i) => domain[i].type === 'int' ? _round(x) : x)
		})
	}
}

const best = (state) => state.patternSearch
	? bestPatternSearch(state.patternSearch)
	: state.initial

module.exports = {
	init,
	iter,
	best,
}
