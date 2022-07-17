
const search = async (algo, problem, options = {}) => {
	const { init, iter, limit, best } = algo
	const state = await init(problem, options)

	while (!limit(state)) {
		await iter(state)
	}

	return best(state)
}

module.exports = { search }
