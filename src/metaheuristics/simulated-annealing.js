const { uniform } = require('@kmamal/util/random/uniform')

const makeAccept = (schedule) =>
	(state, candidateValue) => {
		if (candidateValue < state.value) { return true }
		const p = schedule(state, candidateValue)
		const r = uniform()
		return r < p
	}

const kirkpatrickSchedule = (state, candidateValue) => candidateValue > state.value
	? Math.exp((state.value - candidateValue) / state.temperature)
	: 1

module.exports = {
	makeAccept,
	kirkpatrickSchedule,
}
