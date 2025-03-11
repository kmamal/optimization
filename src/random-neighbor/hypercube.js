const { uniform } = require('@kmamal/util/random/uniform')

const __sampleHypercube = (order, dst, src, steps) => {
	for (let i = 0; i < order; i++) {
		dst[i] = src[i] + steps[i] * (uniform() * 2 - 1)
	}
}

const sampleHypercube = (vars, steps) => {
	const { length } = vars
	const res = new Array(length)
	__sampleHypercube(length, res, vars, steps)
	return res
}

const sampleHypercube$$$ = (vars, steps) => {
	__sampleHypercube(vars.length, vars, vars, steps)
	return vars
}

sampleHypercube.$$$ = sampleHypercube$$$

module.exports = {
	__sampleHypercube,
	sampleHypercube,
}
