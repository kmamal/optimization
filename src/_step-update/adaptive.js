const { makeGeometric } = require('./geometric')

const makeAdaptive = (shrinkRate, growRate = 1 / shrinkRate) => {
	const grow = makeGeometric(growRate)
	const shrink = makeGeometric(shrinkRate)

	return (steps, success) => {
		success ? grow(steps) : shrink(steps)
	}
}

module.exports = { makeAdaptive }
