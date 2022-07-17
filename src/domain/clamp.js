const { clamp: clampNumber } = require('@kmamal/util/number/clamp')

const dimensionClamp = ({ type, from, to }, x) => {
	switch (type) {
		case 'real': { return clampNumber(x, from, to) }
		case 'integer': { return Math.floor(clampNumber(x, from, to)) }
		default: throw new Error("unknown type")
	}
}

const __clamp = (dst, src, domain) => {
	for (let i = 0; i < domain.length; i++) {
		dst[i] = dimensionClamp(domain[i], src[i])
	}
}

const clamp$$$ = (domain, variables) => {
	__clamp(variables, variables, domain)
	return variables
}

const clamp = (domain, variables) => {
	const res = new Array(domain.length)
	__clamp(res, variables, domain)
	return res
}

clamp.$$$ = clamp$$$

module.exports = {
	dimensionClamp,
	__clamp,
	clamp,
}
