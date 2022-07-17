const SDL = require('@kmamal/sdl')
const Canvas = require('canvas')
const { init, expand } = require('../../1d/find-bounds/fibonacci')
const { iter } = require('../../1d/bounded/fibonacci')
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
let goal
let func
let state
let states = []

const initialize = async () => {
	start = randInt(-10000, 10000)
	goal = randInt(-10000, 10000)
	const dimension = { type: 'integer', from: -10000, to: 10000 }
	func = (x) => Math.abs(goal - x)
	state = await init({ func, dimension }, start, func(start), Math.sign(goal - start))
	states = [ { ...state } ]
	console.log('init', { start, goal, state })
}

const iterate = async () => {
	if (!state.b) {
		await expand(state)
	} else {
		await iter(state)
	}
	states.push({ ...state })
	console.log('iter', { start, goal, state })
}

const draw = () => {
	ctx.fillStyle = 'black'
	ctx.fillRect(0, 0, width, height)

	ctx.lineWidth = 1

	const range = Math.abs(goal - start) * 3
	const offset = Math.min(goal, start) - range * 0.33

	for (let i = 0; i < states.length; i++) {
		const s = states[i]
		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
		ctx.fillRect(0, 0, width, height)

		ctx.fillStyle = i === states.length - 1 ? 'green' : 'white'
		if (state.b) {
			ctx.fillRect(Math.floor(((s.a - offset) / range) * (width - 1)), 0, 1, height)
			ctx.fillRect(Math.floor(((s.b - offset) / range) * (width - 1)), 0, 1, height)
			ctx.fillRect(Math.floor(((s.c - offset) / range) * (width - 1)), 0, 1, height)
			ctx.fillRect(Math.floor(((s.d - offset) / range) * (width - 1)), 0, 1, height)
		} else {
			ctx.fillRect(Math.floor(((s.a - offset) / range) * (width - 1)), 0, 1, height)
			ctx.fillRect(Math.floor(((s.c - offset) / range) * (width - 1)), 0, 1, height)
		}
	}

	ctx.fillStyle = 'red'
	ctx.fillRect(Math.floor(((goal - offset) / range) * (width - 1)), 0, 1, height)

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
