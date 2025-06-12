const { getRandom } = require('@kmamal/domains/get-random')

const { addBy } = require('@kmamal/heap')

const _getValue = (x) => x.value

const goodRandomInitial = async ({ func, domain }, options = {}) => {
	const {
		numPoints = 1,
		maxAttempts = Math.max(numPoints, 100),
	} = options

	const points = []
	for (let i = 0; i < maxAttempts; i++) {
		const solution = getRandom(domain)
		const value = await func(solution)
		const point = { solution, value }
		addBy(points, point, _getValue)
		points.length = Math.min(points.length, numPoints)
	}

	return points
}

module.exports = { goodRandomInitial }
