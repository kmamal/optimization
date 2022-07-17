const SDL = require('@kmamal/sdl')
const Canvas = require('canvas')
const functions = require('../test-functions/simple')
const { makeFinite } = require('../../domain/make-finite')
const { init, iter } = require('../../bayesian')
const { makeWeightedScale } = require('../../../../../color/src/scale')
const { convert } = require('../../../../../color/src/convert')
const { makeTransformers } = require('@kmamal/chart/coordinates')

const algoNelderMead = require('../../nelder-mead')
const { search } = require('../../search')

const { defineFor } = require('../../../linear-algebra/vector')
const N = require('../../../domains/number')
const V = defineFor(N)

const window = SDL.video.createWindow({
	resizable: true,
})

let width
let height
let canvas
let ctx
let toX
let fromX
let toY
let fromY

window.on('resize', () => {
	({ width, height } = window)
	canvas = Canvas.createCanvas(width, height)
	ctx = canvas.getContext('2d')
	makeFuncImage()
	draw()
})

const entries = Object.entries(functions)
let index = -1
let entry
let problem
let state
let evaluations
let funcImage

const nextFunction = () => {
	index = (index + 1) % entries.length
	entry = entries[index]
	const [ , make ] = entry
	problem = make(2)
	problem.domain = makeFinite(problem.domain)
	problem._func = problem.func
	problem.func = (...args) => {
		evaluations++
		return problem._func(...args)
	}
	makeFuncImage()
}

const reset = async () => {
	evaluations = 0
	state = await init(
		problem,
		{
			makeAcquisitionFunc: (points, uncertainty = 2) => {
				let max = -Infinity
				let min = Infinity
				for (const { value } of points) {
					max = Math.max(max, value)
					min = Math.min(min, value)
				}
				const halfRange = (max / 2) - (min / 2) || 1

				for (let i = 0; i < points.length; i++) {
					const point = points[i]
					point.normalizedValue = ((point.value / 2) - (min / 2)) / halfRange
				}

				return (...candidate) => {
					let totalWeight = 0
					for (let i = 0; i < points.length; i++) {
						const point = points[i]
						const distance = V.norm(V.sub(candidate, point.solution))
						point.weight = 1 / distance
						totalWeight += point.weight
					}

					let result = 0
					for (const { weight, normalizedValue } of points) {
						const influence = weight / totalWeight || 1
						const hope = uncertainty * (1 - influence)
						result += influence * (normalizedValue - hope)
					}
					return result
				}
			},
			search: async (_func) => {
				let evaluations = 0
				const func = (...args) => {
					evaluations++
					return _func(...args)
				}

				const point = await search(
					{
						...algoNelderMead,
						limit: () => evaluations > 300,
					},
					{
						...problem,
						func,
					},
				)

				return point.solution
			},
		},
	)
}

let stepping
const nextStep = async () => {
	stepping = true
	await iter(state)
	stepping = false
}

const scale = makeWeightedScale([
	[ -0.1, { r: 0.267, g: 0.040, b: 0.329 } ],
	[ 0.2, { r: 0.259, g: 0.255, b: 0.525 } ],
	[ 0.5, { r: 0.133, g: 0.553, b: 0.553 } ],
	[ 0.8, { r: 0.376, g: 0.792, b: 0.376 } ],
	[ 1.1, { r: 0.992, g: 0.906, b: 0.145 } ],
], 'rgb')

const makeFuncImage = () => {
	if (!width || !height) { return }

	const canvas2 = Canvas.createCanvas(width, height)
	const ctx2 = canvas2.getContext('2d')

	const { domain: _domain, _func: func, minima, visualization } = problem
	const domain = visualization?.domain ?? _domain

	{
		const { from, to } = domain[0]
		const transformers = makeTransformers(from, to, 0, width)
		toX = transformers.transformPosition
		fromX = transformers.reversePosition
	}
	{
		const { from, to } = domain[1]
		const transformers = makeTransformers(from, to, height, 0)
		toY = transformers.transformPosition
		fromY = transformers.reversePosition
	}

	const values = new Array((width + 1) * (height + 1))
	let min = Infinity
	let max = -Infinity

	let valueIndex = 0
	for (let y = 0; y <= height; y++) {
		for (let x = 0; x <= width; x++) {
			const p0 = fromX(x)
			const p1 = fromY(y)
			const value = func(p0, p1)
			min = Math.min(min, value)
			max = Math.max(max, value)
			values[valueIndex++] = value
		}
	}

	if (visualization?.logScale) {
		max = Math.log(max || Number.EPSILON)
		min = Math.log(min || Number.EPSILON)
	}
	const range = max - min

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			let value = values[y * (width + 1) + x]
			if (visualization?.logScale) { value = Math.log(value || Number.EPSILON) }
			const r = (value - min) / range
			const color = convert(scale(r), 'rgb')
			ctx2.fillStyle = `rgb(${
				Math.floor(color.r * 255)
			},${
				Math.floor(color.g * 255)
			},${
				Math.floor(color.b * 255)
			})`
			ctx2.fillRect(x, y, 1, 1)
		}
	}

	ctx2.fillStyle = 'red'
	for (const point of minima) {
		const x = toX(point[0])
		const y = toY(point[1])
		ctx2.fillRect(x - 1, y - 1, 3, 3)
	}

	funcImage = new Canvas.Image()
	funcImage.src = canvas2.toDataURL('image/png')
}

const draw = () => {
	console.log(state, problem.minima, evaluations)

	ctx.drawImage(funcImage, 0, 0)

	if (state) {
		const { points, bestIndex } = state

		for (let i = 0; i < points.length; i++) {
			const { solution } = points[i]
			ctx.fillStyle = i === bestIndex ? 'red' : 'white'
			const x = toX(solution[0])
			const y = toY(solution[1])
			ctx.fillRect(x - 1, y - 1, 3, 3)
		}
	}

	const buffer = canvas.toBuffer('raw')
	window.render(width, height, width * 4, 'bgra32', buffer)

	window.setTitle(`${entry[0]}${problem.visualization?.logScale ? '(log)' : ''}`)
}

window.on('keyDown', async ({ key }) => {
	if (stepping) { return }
	switch (key) {
		case 'space': {
			await nextStep()
			draw()
		} break
		case 'shift': {
			nextFunction()
			await reset()
			draw()
		} break
		case 'return': {
			await reset()
			draw()
		} break
		// No default
	}
})

nextFunction()
reset().then(draw)
