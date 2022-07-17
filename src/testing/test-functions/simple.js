
const rastrigin = (order) => ({
	order,
	func (...args) {
		let sum = 0
		for (let i = 0; i < order; i++) {
			const x = args[i]
			sum += x ** 2 - 10 * Math.cos(2 * Math.PI * x)
		}
		return 10 * order + sum
	},
	minima: [ new Array(order).fill(0) ],
	domain: new Array(order).fill({ type: 'real', from: -5.12, to: 5.12 }),
})


const ackley = () => ({
	order: 2,
	func (x, y) {
		return 20 - 20 * Math.exp(-Math.sqrt((x ** 2 + y ** 2) / 2) / 5)
				+ Math.E - Math.exp((Math.cos(2 * Math.PI * x) + Math.cos(2 * Math.PI * y)) / 2)
	},
	minima: [ [ 0, 0 ] ],
	domain: new Array(2).fill({ type: 'real', from: -5, to: 5 }),
})


const sphere = (order) => ({
	order,
	func (...args) {
		let sum = 0
		for (let i = 0; i < order; i++) {
			sum += args[i] ** 2
		}
		return sum
	},
	minima: [ new Array(order).fill(0) ],
	domain: new Array(order).fill({ type: 'real', from: -Infinity, to: Infinity }),
	visualization: {
		domain: new Array(order).fill({ type: 'real', from: -100, to: 100 }),
	},
})


const rosenbrock = (order) => ({
	order,
	func (...args) {
		let sum = 0
		for (let i = 0; i < order - 1; i++) {
			const x = args[i]
			const x1 = args[i + 1]
			sum += 100 * (x1 - x ** 2) ** 2 + (1 - x) ** 2
		}
		return sum
	},
	minima: [ new Array(order).fill(1) ],
	domain: new Array(order).fill({ type: 'real', from: -Infinity, to: Infinity }),
	visualization: {
		domain: [
			{ type: 'real', from: -2, to: 2 },
			{ type: 'real', from: -1, to: 3 },
		],
		logScale: true,
	},
})


const beale = () => ({
	order: 2,
	func (x, y) {
		return 0
				+ (1.5 - x + x * y) ** 2
				+ (2.25 - x + x * y ** 2) ** 2
				+ (2.625 - x + x * y ** 3) ** 2
	},
	minima: [ [ 3, 0.5 ] ],
	domain: new Array(2).fill({ type: 'real', from: -4.5, to: 4.5 }),
	visualization: {
		logScale: true,
	},
})


const goldsteinPrice = () => ({
	order: 2,
	func (x, y) {
		const x2 = x ** 2
		const y2 = y ** 2
		return (1 + (x + y + 1) ** 2 * (19 - 14 * x + 3 * x2 - 14 * y + 6 * x * y + 3 * y2))
				* (30 + (2 * x - 3 * y) ** 2 * (18 - 32 * x + 12 * x2 + 48 * y - 36 * x * y + 27 * y2)) - 3
	},
	minima: [ [ 0, -1 ] ],
	domain: new Array(2).fill({ type: 'real', from: -2, to: 2 }),
	visualization: {
		logScale: true,
	},
})


const booth = () => ({
	order: 2,
	func (x, y) {
		return (x + 2 * y - 7) ** 2 + (2 * x + y - 5) ** 2
	},
	minima: [ [ 1, 3 ] ],
	domain: new Array(2).fill({ type: 'real', from: -10, to: 10 }),
	visualization: {
		logScale: true,
	},
})


const bukin6 = () => ({
	order: 2,
	func (x, y) {
		return 100 * Math.sqrt(Math.abs(y - 0.01 * x ** 2)) + 0.01 * Math.abs(x + 10)
	},
	minima: [ [ -10, 1 ] ],
	domain: [
		{ type: 'real', from: -15, to: -5 },
		{ type: 'real', from: -3, to: 3 },
	],
})


const matyas = () => ({
	order: 2,
	func (x, y) {
		return 0.26 * (x ** 2 + y ** 2) - 0.48 * x * y
	},
	minima: [ [ 0, 0 ] ],
	domain: new Array(2).fill({ type: 'real', from: -10, to: 10 }),
	visualization: {
		logScale: true,
	},
})


const levi13 = () => ({
	order: 2,
	func (x, y) {
		return Math.sin(3 * Math.PI * x) ** 2
				+ (x - 1) ** 2 * (1 + Math.sin(3 * Math.PI * y) ** 2)
				+ (y - 1) ** 2 * (1 + Math.sin(2 * Math.PI * y) ** 2)
	},
	minima: [ [ 1, 1 ] ],
	domain: new Array(2).fill({ type: 'real', from: -10, to: 10 }),
})


const himmelblau = () => ({
	order: 2,
	func (x, y) {
		return (x ** 2 + y - 11) ** 2 + (x + y ** 2 - 7) ** 2
	},
	minima: [
		[ 3, 2 ],
		[ -2.805118, 3.131312 ],
		[ -3.779310, -3.283186 ],
		[ 3.584428, -1.848126 ],
	],
	domain: new Array(2).fill({ type: 'real', from: -5, to: 5 }),
	visualization: {
		logScale: true,
	},
})


const threeHumpCamel = () => ({
	order: 2,
	func (x, y) {
		return 2 * x ** 2 - 1.05 * x ** 4 + x ** 6 / 6 + x * y + y ** 2
	},
	minima: [ [ 0, 0 ] ],
	domain: new Array(2).fill({ type: 'real', from: -5, to: 5 }),
	visualization: {
		logScale: true,
	},
})


const easom = () => ({
	order: 2,
	func (x, y) {
		return 1 - Math.cos(x) * Math.cos(y) * Math.exp(-((x - Math.PI) ** 2 + (y - Math.PI) ** 2))
	},
	minima: [ [ Math.PI, Math.PI ] ],
	domain: new Array(2).fill({ type: 'real', from: -100, to: 100 }),
	visualization: {
		domain: new Array(2).fill({ type: 'real', from: -1, to: 7 }),
	},
})


const crossInTray = () => ({
	order: 2,
	func (x, y) {
		return 2.06261 - 0.0001 * (
			(Math.abs(Math.sin(x) * Math.sin(y) * Math.exp(Math.abs(100 - Math.sqrt(x ** 2 + y ** 2) / Math.PI))) + 1) ** 0.1
		)
	},
	minima: [
		[ 1.34941, -1.34941 ],
		[ 1.34941, 1.34941 ],
		[ -1.34941, 1.34941 ],
		[ -1.34941, -1.34941 ],
	],
	domain: new Array(2).fill({ type: 'real', from: -10, to: 10 }),
})


const eggholder = () => ({
	order: 2,
	func (x, y) {
		const y47 = y + 47
		return 959.6407
			- y47 * Math.sin(Math.sqrt(Math.abs(x / 2 + y47)))
			- x * Math.sin(Math.sqrt(Math.abs(x - y47)))
	},
	minima: [ [ 512, 404.2319 ] ],
	domain: new Array(2).fill({ type: 'real', from: -512, to: 512 }),
	visualization: {
		domain: new Array(2).fill({ type: 'real', from: -1000, to: 1000 }),
	},
})


const hoelderTable = () => ({
	order: 2,
	func (x, y) {
		return 19.2085 - Math.abs(Math.sin(x) * Math.cos(y) * Math.exp(Math.abs(1 - Math.sqrt(x ** 2 + y ** 2) / Math.PI)))
	},
	minima: [
		[ 8.05502, 9.66459 ],
		[ -8.05502, 9.66459 ],
		[ 8.05502, -9.66459 ],
		[ -8.05502, -9.66459 ],
	],
	domain: new Array(2).fill({ type: 'real', from: -10, to: 10 }),
})


const mccormic = () => ({
	order: 2,
	func (x, y) {
		return 1.9133 + Math.sin(x + y) + (x - y) ** 2 - 1.5 * x + 2.5 * y + 1
	},
	minima: [ [ -0.54719, -1.54719 ] ],
	domain: [
		{ type: 'real', from: -1.5, to: 4 },
		{ type: 'real', from: -3, to: 4 },
	],
})


const schaffer2 = () => ({
	order: 2,
	func (x, y) {
		const x2 = x ** 2
		const y2 = y ** 2
		return 0.5 + (Math.sin(x2 - y2) ** 2 - 0.5) / (1 + 0.001 * (x2 + y2)) ** 2
	},
	minima: [ [ 0, 0 ] ],
	domain: new Array(2).fill({ type: 'real', from: -100, to: 100 }),
	visualization: {
		domain: new Array(2).fill({ type: 'real', from: -50, to: 50 }),
	},
})


const schaffer4 = () => ({
	order: 2,
	func (x, y) {
		const x2 = x ** 2
		const y2 = y ** 2
		return -0.292579 + 0.5 + (Math.cos(Math.sin(Math.abs(x2 - y2))) ** 2 - 0.5) / (1 + 0.001 * (x2 + y2)) ** 2
	},
	minima: [
		[ 0, 1.25313 ],
		[ 0, -1.25313 ],
		[ 1.25313, 0 ],
		[ -1.25313, 0 ],
	],
	domain: new Array(2).fill({ type: 'real', from: -100, to: 100 }),
	visualization: {
		domain: new Array(2).fill({ type: 'real', from: -50, to: 50 }),
	},
})


const styblinskiTang = (order) => ({
	order,
	func (...args) {
		let sum = 0
		for (let i = 0; i < order; i++) {
			const x = args[i]
			const x2 = x ** 2
			sum += x2 ** 2 - 16 * x2 + 5 * x
		}
		return order * 39.16617 + sum / 2
	},
	minima: [ new Array(order).fill(-2.903534) ],
	domain: new Array(order).fill({ type: 'real', from: -5, to: 5 }),
})


module.exports = {
	rastrigin,
	ackley,
	sphere,
	rosenbrock,
	beale,
	goldsteinPrice,
	booth,
	bukin6,
	matyas,
	levi13,
	himmelblau,
	threeHumpCamel,
	easom,
	crossInTray,
	eggholder,
	hoelderTable,
	mccormic,
	schaffer2,
	schaffer4,
	styblinskiTang,
}
