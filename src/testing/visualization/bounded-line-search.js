const SDL = require('@kmamal/sdl')
const Canvas = require('canvas')
const { init, iter } = require('../../1d/bounded/fibonacci')
const { randInt } = require('@kmamal/util/random/rand-int')

const window = SDL.video.createWindow({
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

let start
let end
let goal
let func
let state
let states = []

const initialize = async () => {
	const a = randInt(-10000, 10000)
	const b = randInt(-10000, 10000)
	const c = randInt(-10000, 10000)
	start = Math.min(a, b, c)
	end = Math.max(a, b, c)
	goal = [ a, b, c ].find((x) => x !== start && x !== end)
	func = (x) => Math.abs(goal - x)
	state = await init({ func }, start, end)
	states = [ { ...state } ]
	console.log('init', { start, end, goal, state })
}

const iterate = async () => {
	await iter(state, func)
	states.push({ ...state })
	console.log('iter', { start, end, goal, state })
}

const draw = () => {
	ctx.fillStyle = 'black'
	ctx.fillRect(0, 0, width, height)

	ctx.lineWidth = 1

	const range = end - start
	for (let i = 0; i < states.length; i++) {
		const s = states[i]

		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
		ctx.fillRect(0, 0, width, height)

		ctx.fillStyle = i === states.length - 1 ? 'green' : 'white'
		ctx.fillRect(Math.floor(((s.a - start) / range) * (width - 1)), 0, 1, height)
		ctx.fillRect(Math.floor(((s.b - start) / range) * (width - 1)), 0, 1, height)
		ctx.fillRect(Math.floor(((s.c - start) / range) * (width - 1)), 0, 1, height)
		ctx.fillRect(Math.floor(((s.d - start) / range) * (width - 1)), 0, 1, height)
	}

	ctx.fillStyle = 'red'
	ctx.fillRect(Math.floor(((goal - start) / range) * (width - 1)), 0, 1, height)

	const buffer = canvas.toBuffer('raw')
	window.render(width, height, width * 4, 'bgra32', buffer)
}

window.on('keyDown', async ({ key }) => {
	switch (key) {
		case 'return': {
			await initialize()
			draw()
		} break
		case 'space': {
			await iterate()
			draw()
		} break
		// No default
	}
})

initialize().then(draw)
