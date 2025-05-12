const { search } = require('./search')

const multipleStarts = async (numRestarts, algo, problem, options = {}) => {
	let bestResult = await search(algo, problem, options)
	for (let i = 1; i < numRestarts; i++) {
		const result = await search(algo, problem, options)
		if (result.value < bestResult.value) { bestResult = result }
	}
	return bestResult
}

module.exports = { multipleStarts }
