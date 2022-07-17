const { random } = require('@kmamal/util/random/random')

const __sampleHypercube = (order, dst, src, steps) => {
	for (let i = 0; i < order; i++) {
		dst[i] = src[i] + steps[i] * (random() * 2 - 1)
	}
}

const sampleHypercube$$$ = (vars, steps) => {
	__sampleHypercube(vars.length, vars, vars, steps)
	return vars
}

const sampleHypercube = (vars, steps) => {
	const { length } = vars
	const res = new Array(length)
	__sampleHypercube(length, res, vars, steps)
	return res
}

sampleHypercube.$$$ = sampleHypercube$$$

module.exports = {
	__sampleHypercube,
	sampleHypercube,
}
