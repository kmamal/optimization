const { sampleBox } = require('../../sampling/box')

const __sampleHyperbox = (order, dst, src, steps) => {
	const sample = sampleBox(order)
	for (let i = 0; i < order; i++) {
		dst[i] = src[i] + steps[i] * sample[i]
	}
}

const sampleHyperbox$$$ = (vars, steps) => {
	__sampleHyperbox(vars.length, vars, vars, steps)
	return vars
}

const sampleHyperbox = (vars, steps) => {
	const { length } = vars
	const res = new Array(length)
	__sampleHyperbox(length, res, vars, steps)
	return res
}

sampleHyperbox.$$$ = sampleHyperbox$$$

module.exports = {
	__sampleHyperbox,
	sampleHyperbox,
}
