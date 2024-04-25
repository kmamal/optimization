const { uniform } = require('@kmamal/util/random/uniform')

const makeAccept = (p) =>
	(state, candidateValue) => candidateValue === state.value
		? uniform() < p
		: candidateValue < state.value

module.exports = { makeAccept }
