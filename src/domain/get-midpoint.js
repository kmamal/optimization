const { map } = require('@kmamal/util/array/map')

const calcSafeMidpoint = (a, b) => (b / 2 - a / 2) + a

const getDimensionMidpoint = ({ type, from, to }) => {
	switch (type) {
		case 'real': return calcSafeMidpoint(from, to)
		case 'integer': return Math.floor(calcSafeMidpoint(from, to))
		default: throw new Error("unknown type")
	}
}

const getMidpoint = (domain) => map(domain, getDimensionMidpoint)

module.exports = { getMidpoint }
