
const multipleStarts = async (numRestarts, search) => {
	let bestResult = await search()
	for (let i = 1; i < numRestarts; i++) {
		const result = await search()
		if (result.value < bestResult.value) { bestResult = result }
	}
	return bestResult
}

module.exports = { multipleStarts }
