const { sampleSphere } = require('../../sampling/sphere')
const { uniform } = require('@kmamal/util/random/uniform')

const __sampleHyperball = (order, dst, src, steps) => {
	const sample = sampleSphere(order)
	const radius = uniform()
	for (let i = 0; i < order; i++) {
		dst[i] = src[i] + radius * steps[i] * sample[i]
	}
}

const sampleHyperball$$$ = (vars, steps) => {
	__sampleHyperball(vars.length, vars, vars, steps)
	return vars
}

const sampleHyperball = (vars, steps) => {
	const { length } = vars
	const res = new Array(length)
	__sampleHyperball(length, res, vars, steps)
	return res
}

sampleHyperball.$$$ = sampleHyperball$$$

module.exports = {
	__sampleHyperball,
	sampleHyperball,
}
