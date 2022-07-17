const { map } = require('@kmamal/util/array/map')
const { zipWith } = require('@kmamal/util/array/zip')

const makeDimensionFinite = ({ type, from, to }) => ({
	type,
	from: Math.max(-Number.MAX_VALUE, from),
	to: Math.min(Number.MAX_VALUE, to),
})

const restoreVariableInfinity = ([ x, { from, to } ]) => {
	if (x === -Number.MAX_VALUE && from === -Infinity) { return -Infinity }
	if (x === Number.MAX_VALUE && to === Infinity) { return Infinity }
	return x
}

const makeFinite = (domain) => map(domain, makeDimensionFinite)

const restoreInfinities = (variables, domain) => zipWith(
	[ variables, domain ],
	restoreVariableInfinity,
)

module.exports = {
	makeFinite,
	restoreInfinities,
}
