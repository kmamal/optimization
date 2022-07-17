const { map } = require('@kmamal/util/array/map')

// NOTE: The full range (from -MAX_VALUE to MAX_VALUE) would overflow.

const calcSafeHalfRange = (a, b) => b / 2 - a / 2

const getDimensionHalfRange = ({ type, from, to }) => {
	switch (type) {
		case 'real': return calcSafeHalfRange(from, to)
		case 'integer': return Math.floor(calcSafeHalfRange(from, to))
		default: throw new Error("unknown type")
	}
}

const getHalfRanges = (domain) => map(domain, getDimensionHalfRange)

module.exports = { getHalfRanges }
