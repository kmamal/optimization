const { getRandom } = require('./domain/get-random')
const { accept: acceptHillClimbing } = require('./metaheuristics/hill-climbing')

const init = async (
	{ order, domain, func },
	{ initial = {}, searchLine, accept, ...options } = {},
) => {
	const solution = initial.solution ?? getRandom(domain)
	const value = initial.value ?? await func(...solution)
	return {
		order,
		domain,
		func,
		solution,
		value,
		searchLine,
		accept: accept ?? acceptHillClimbing,
		index: -1,
		countFailed: 0,
		...options,
	}
}

const iter = async (state) => {
	const { order, solution, searchLine, accept } = state

	const index = (state.index + 1) % order
	state.index = index

	const { x, fx: candidateValue } = await searchLine()

	if (accept(state, candidateValue)) {
		solution[index] = x
		state.value = candidateValue
		state.countFailed = 0
	} else {
		state.countFailed++
	}
}

const best = (state) => ({
	solution: state.solution,
	value: state.value,
})

module.exports = {
	init,
	iter,
	best,
}
