const { map } = require('@kmamal/util/array/map')
const { randFloat } = require('@kmamal/util/random/rand-float')
const { randInt } = require('@kmamal/util/random/rand-int')

const getDimensionRandom = ({ type, from, to }) => {
	switch (type) {
		case 'real': return randFloat(from, to)
		case 'integer': return randInt(from, to + 1)
		default: throw new Error("unknown type")
	}
}

const getRandom = (domain) => map(domain, getDimensionRandom)

module.exports = { getRandom }
