const { random } = require('@kmamal/util/random/random')

const makeAccept = (p) =>
	(state, candidateValue) => candidateValue === state.value
		? random() < p
		: candidateValue < state.value

module.exports = { makeAccept }
