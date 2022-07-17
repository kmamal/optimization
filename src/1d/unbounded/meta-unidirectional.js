
const search = async (algo, problem, a, fa, step) => {
	const { init, expand, iter, limit, best } = algo

	const state = await init(problem, a, fa, step)
	while (state.b === undefined) { await expand(state) }
	while (!limit(state)) { await iter(state) }
	return best(state)
}

module.exports = { search }
