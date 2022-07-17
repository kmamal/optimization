const SDL = require('@kmamal/sdl')
const functions = require('../test-functions/simple')
const { makeWeightedScale } = require('../../../../../color/src/scale')
const { convert } = require('../../../../../color/src/convert')
const { makeTransformers } = require('@kmamal/chart/coordinates')

const window = SDL.video.createWindow({
	resizable: true,
})

let width
let height
let toX
let fromX
let toY
let fromY

window.on('resize', () => {
	({ width, height } = window)
	draw()
})

let index = -1
const entries = Object.entries(functions)
const nextFunction = () => {
	index = (index + 1) % entries.length
}

const scale = makeWeightedScale([
	[ -0.1, { r: 0.267, g: 0.040, b: 0.329 } ],
	[ 0.2, { r: 0.259, g: 0.255, b: 0.525 } ],
	[ 0.5, { r: 0.133, g: 0.553, b: 0.553 } ],
	[ 0.8, { r: 0.376, g: 0.792, b: 0.376 } ],
	[ 1.1, { r: 0.992, g: 0.906, b: 0.145 } ],
], 'rgb')

const draw = () => {
	const [ name, fn ] = entries[index]
	const { domain: _domain, func, minima, visualization } = fn(2)
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
	for (let j = 0; j <= height; j++) {
		for (let i = 0; i <= width; i++) {
			const x = fromX(i)
			const y = fromY(j)
			const value = func(x, y)
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

	const buffer = Buffer.alloc(width * height * 4)
	let writeIndex = 0
	for (let j = 0; j < height; j++) {
		for (let i = 0; i < width; i++) {
			let value = values[j * (width + 1) + i]
			if (visualization?.logScale) { value = Math.log(value || Number.EPSILON) }
			const r = (value - min) / range
			const color = convert(scale(r), 'rgb')
			buffer[writeIndex++] = Math.floor(color.r * 255)
			buffer[writeIndex++] = Math.floor(color.g * 255)
			buffer[writeIndex++] = Math.floor(color.b * 255)
			buffer[writeIndex++] = 255
		}
	}

	for (const [ mx, my ] of minima) {
		const mi = Math.floor(toX(mx))
		const mj = Math.floor(toY(my))
		for (let dj = -1; dj <= 1; dj++) {
			for (let di = -1; di <= 1; di++) {
				const i = mi + di
				const j = mj + dj
				writeIndex = (j * width + i) * 4
				buffer[writeIndex++] = 255
				buffer[writeIndex++] = 0
				buffer[writeIndex++] = 0
			}
		}
	}

	window.render(width, height, width * 4, 'rgba32', buffer)
	window.setTitle(name)
}

window.on('keyDown', ({ key }) => {
	if (key !== 'space') { return }

	nextFunction()
	draw()
})

nextFunction()
