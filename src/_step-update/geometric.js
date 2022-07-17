
const makeGeometric = (rate) =>
	(steps) => {
		for (let i = 0; i < steps.length; i++) {
			steps[i] *= rate
		}
	}

module.exports = { makeGeometric }
