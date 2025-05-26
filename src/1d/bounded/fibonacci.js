const N = require('@kmamal/numbers/js')
const { fibonacci } = require('@kmamal/math/fibonacci').defineFor(N)

const init = async ({ func }, a, b) => {
	const range = b - a
	let index = 1
	while (fibonacci(index) < range) { index++ }

	const ci = index - 2
	const c = a + fibonacci(ci)
	const di = index - 1
	const d = a + fibonacci(di)
	const [ fc, fd ] = await Promise.all([ func(c), func(d) ])
	const sign = Math.sign(b - a)
	return { func, a, b, c, fc, ci, d, fd, di, sign, done: false }
}

const iter = async (state) => {
	if (state.done) { return }

	const { func, c, fc, d, fd, sign } = state
	state.di = state.ci
	state.ci--

	if (fd < fc) {
		state.a = c
		state.fa = fc
		state.c = d
		state.fc = fd
		state.d = state.a + sign * fibonacci(state.di)
		state.fd = await func(state.d)
	}
	else {
		state.b = d
		state.fb = fd
		state.d = c
		state.fd = fc
		state.c = state.a + sign * fibonacci(state.ci)
		state.fc = await func(state.c)
	}

	if (state.ci === 1) { state.done = true }
}

const best = (state) => {
	const { a, fa, b, fb, c, fc, d, fd } = state
	let x = a
	let fx = fa ?? Infinity
	if (fb < fx) {
		x = b
		fx = fb
	}
	if (fc < fx) {
		x = c
		fx = fc
	}
	if (fd < fx) {
		x = d
		fx = fd
	}
	return { x, fx }
}

module.exports = {
	init,
	iter,
	best,
}
