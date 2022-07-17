const { search: searchUnidirectional } = require('./meta-unidirectional')

const search = async (algo, problem, c, fc, step) => {
	const [
		{ x: a, fx: fa },
		{ x: b, fx: fb },
	] = await Promise.all([
		searchUnidirectional(algo, problem, c, fc, step),
		searchUnidirectional(algo, problem, c, fc, -step),
	])

	return fa < fb ? { x: a, fx: fa } : { x: b, fx: fb }
}

module.exports = { search }
