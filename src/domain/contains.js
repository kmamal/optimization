
const _inBounds = (x, from, to) => from <= x && x <= to

const dimensionContains = ({ type, from, to }, x) => {
	switch (type) {
		case 'real': { return _inBounds(x, from, to) }
		case 'integer': { return _inBounds(x, from, to) && Math.floor(x) === x }
		default: throw new Error("unknown type")
	}
}

const contains = (domain, variables) => {
	for (let i = 0; i < domain.length; i++) {
		if (!dimensionContains(domain[i], variables[i])) { return false }
	}
	return true
}

module.exports = {
	dimensionContains,
	contains,
}
