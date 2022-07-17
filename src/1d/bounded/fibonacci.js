const { defineFor } = require('../../../fib')
const N = require('../../../domains/number')
const fib = defineFor(N)

const init = async ({ func }, a, b) => {
	const range = b - a
	let index = 1
	while (fib(index) < range) { index++ }

	const ci = index - 2
	const c = a + fib(ci)
	const di = index - 1
	const d = a + fib(di)
	const [ fc, fd ] = await Promise.all([ func(c), func(d) ])
	const sign = Math.sign(b - a)
	return { func, a, b, c, fc, ci, d, fd, di, sign }
}

const iter = async (state) => {
	const { func, c, fc, d, fd, sign } = state

	if (state.ci === 1) { throw new Error("done") }
	state.di = state.ci
	state.ci--

	if (fd < fc) {
		state.a = c
		state.fa = fc
		state.c = d
		state.fc = fd
		state.d = state.a + sign * fib(state.di)
		state.fd = await func(state.d)
	} else {
		state.b = d
		state.fb = fd
		state.d = c
		state.fd = fc
		state.c = state.a + sign * fib(state.ci)
		state.fc = await func(state.c)
	}
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
