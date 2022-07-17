
const PHI = (1 + Math.sqrt(5)) / 2
const INVPHI = 1 / PHI
const INVPHI2 = INVPHI * INVPHI

const init = async ({ func }, a, b) => {
	const halfRange = (b / 2) - (a / 2)
	const c = (a + INVPHI2 * halfRange) + INVPHI2 * halfRange
	const d = (a + INVPHI * halfRange) + INVPHI * halfRange
	const [ fc, fd ] = await Promise.all([ func(c), func(d) ])
	return { func, a, b, c, fc, d, fd }
}

const iter = async (state) => {
	const { func, c, fc, d, fd } = state

	if (fd < fc) {
		state.a = c
		state.fa = fc
		state.c = d
		state.fc = fd
		const halfRange = (state.b / 2) - (state.a / 2)
		state.d = (state.a + INVPHI * halfRange) + INVPHI * halfRange
		state.fd = await func(state.d)
	} else {
		state.b = d
		state.fb = fd
		state.d = c
		state.fd = fc
		const halfRange = (state.b / 2) - (state.a / 2)
		state.c = (state.a + INVPHI2 * halfRange) + INVPHI2 * halfRange
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
	PHI,
	INVPHI,
	INVPHI2,
	init,
	iter,
	best,
}
