const { getRandom } = require('./domain/get-random')
const { clamp } = require('./domain/clamp')
const { accept: acceptHillClimbing } = require('./metaheuristics/hill-climbing')

const init = async (
	{ order, domain, func },
	{ initial = {}, getNeighbor, accept, ...options } = {},
) => {
	const solution = initial.solution ?? getRandom(domain)
	const value = initial.value ?? await func(...solution)
	return {
		order,
		domain,
		func,
		solution,
		value,
		candidate: new Array(order),
		getNeighbor,
		accept: accept ?? acceptHillClimbing,
		countFailed: 0,
		...options,
	}
}

const iter = async (state) => {
	const { func, domain, solution, candidate, getNeighbor, accept } = state

	getNeighbor(candidate, solution)
	clamp.$$$(domain, candidate)
	const candidateValue = await func(...candidate)

	if (accept(state, candidateValue)) {
		state.solution = candidate
		state.candidate = solution
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
