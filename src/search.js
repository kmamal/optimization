
const search = async ({ algo, problem, limit, options = {} }) => {
	const { init, iter, best } = algo
	const state = await init(problem, options)
	while (!limit(state)) { await iter(state) }
	return best(state)
}

module.exports = { search }
