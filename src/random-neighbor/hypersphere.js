const { sampleSphere } = require('../../../sampling/sphere')

const __sampleHypersphere = (order, dst, src, steps) => {
	const sample = sampleSphere(order)
	for (let i = 0; i < order; i++) {
		dst[i] = src[i] + steps[i] * sample[i]
	}
}

const sampleHypersphere$$$ = (vars, steps) => {
	__sampleHypersphere(vars.length, vars, vars, steps)
	return vars
}

const sampleHypersphere = (vars, steps) => {
	const { length } = vars
	const res = new Array(length)
	__sampleHypersphere(length, res, vars, steps)
	return res
}

sampleHypersphere.$$$ = sampleHypersphere$$$

module.exports = {
	__sampleHypersphere,
	sampleHypersphere,
}
