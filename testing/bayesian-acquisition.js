const Sdl = require('@kmamal/sdl')
const Canvas = require('@napi-rs/canvas')

const { randFloat } = require('@kmamal/util/random/rand-float')

const N = require('@kmamal/numbers/js')
const V = require('@kmamal/linear-algebra/vector').defineFor(N)

const makeAcquisitionFunction = (points, uncertainty) => {
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
}

let points
let func
let variable

const scaleX = 100
const scaleY = 100

const reset = () => {
	points = []
	variable = 1
	addPoint()
	makeFunc()
}

const addPoint = () => {
	points.push({ solution: [ randFloat(0, scaleX) ], value: randFloat(0, scaleY) })
}

const makeFunc = () => {
	func = makeAcquisitionFunction(points, variable)
}

reset()


const window = Sdl.video.createWindow({
	resizable: true,
})

let width
let height
let canvas
let ctx

window.on('resize', () => {
	({ width, height } = window)

	canvas = Canvas.createCanvas(width, height)
	ctx = canvas.getContext('2d')
	draw()
})

const draw = () => {
	ctx.fillStyle = 'black'
	ctx.fillRect(0, 0, width, height)

	ctx.strokeStyle = 'white'
	ctx.beginPath()
	for (let x = 0; x < width; x++) {
		const value = func((x / width) * scaleX)
		const y = ((1 - value) / 2) * height
		ctx[x === 0 ? 'moveTo' : 'lineTo'](x, y)
	}
	ctx.stroke()

	ctx.fillStyle = 'red'
	for (const { solution, normalizedValue } of points) {
		const x = (solution[0] / scaleX) * width
		const y = ((1 - normalizedValue) / 2) * height
		ctx.fillRect(x - 2, y - 2, 4, 4)
	}

	const buffer = Buffer.from(ctx.getImageData(0, 0, width, height).data)
	window.render(width, height, width * 4, 'rgba32', buffer)
}

window.on('keyDown', ({ key }) => {
	switch (key) {
		case 'space': {
			addPoint()
			makeFunc()
			draw()
		} break
		case 'return': {
			reset()
			draw()
		} break
		case 'shift': {
			variable++
			makeFunc()
			draw()
		} break
		// No default
	}
})
