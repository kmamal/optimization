
const calculateRate = (order, trials) => {
	const numDirections = 3 ** order - 1
	const halvingTime = trials * numDirections
	const rate = (1 / 2) ** (1 / halvingTime)
	return rate
}

module.exports = { calculateRate }
