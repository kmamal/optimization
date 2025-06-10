const { copy } = require('@kmamal/util/array/copy')

const copy$$$ = copy.$$$

const _iterate = function * (state, index) {
	const { order, domain, candidate } = state
	if (index === order) {
		yield
		return
	}

	const variable = domain[index]
	switch (variable.type) {
		case 'nominal': {
			const { values } = variable
			for (const value of values) {
				candidate[index] = value
				yield* _iterate(state, index + 1)
			}
		} break
		case 'integer': {
			const { from, to } = variable
			for (let x = from; x <= to; x++) {
				candidate[index] = x
				yield* _iterate(state, index + 1)
			}
		} break
		// No default
	}
}

const init = async ({ order, domain, func }, options) => {
	const state = {
		order,
		domain,
		func,
		solution: new Array(order),
		value: null,
		candidate: new Array(order),
		done: false,
		...options,
	}

	const iterator = _iterate(state, 0)
	state.iterator = iterator
	iterator.next()

	copy$$$(state.solution, state.candidate)
	state.value = await func(state.solution)

	return state
}

const iter = async (state) => {
	if (state.done) { return }

	const { done } = state.iterator.next()
	if (done) {
		state.done = true
		return
	}

	const { func, candidate } = state
	const value = await func(candidate)

	if (value < state.value) {
		state.value = value
		copy$$$(state.solution, candidate)
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
