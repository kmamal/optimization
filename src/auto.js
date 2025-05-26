const ExhaustiveSearch = require('./exhaustive-search')
const PatternSearch = require('./pattern-search')
const NelderMead = require('./nelder-mead')

const { Flux } = require('@kmamal/async/flux')
const { serialized } = require('@kmamal/util/function/async/serialized')

const N = require('@kmamal/numbers/js')
const V = require('@kmamal/linear-algebra/vector').defineFor(N)

const { copy } = require('@kmamal/util/array/copy')
const { map } = require('@kmamal/util/array/map')
const { max } = require('@kmamal/util/array/max')
const { roundUp } = require('@kmamal/util/number/rounding')

const copy$$$ = copy.$$$
const map$$$ = map.$$$


const init = async ({ order, domain, func }, { limit, ...options }) => {
	const nominalsIndexes = []
	const nominalsSubdomain = []
	const integersIndexes = []
	const integersSubdomain = []
	const realsIndexes = []
	const realsSubdomain = []

	for (let i = 0; i < domain.length; i++) {
		const variable = domain[i]
		switch (variable.type) {
			case 'nominal': {
				nominalsIndexes.push(i)
				nominalsSubdomain.push(variable)
				break
			}
			case 'integer': {
				integersIndexes.push(i)
				integersSubdomain.push(variable)
				break
			}
			case 'real': {
				realsIndexes.push(i)
				realsSubdomain.push(variable)
				break
			}
			// No default
		}
	}

	const nominalsStateFlux = new Flux()
	const integersStateFlux = new Flux()
	const realsStateFlux = new Flux()
	const evaluateFlux = new Flux()

	const state = {
		order,
		domain,
		func,
		limit,
		done: false,
		solution: new Array(order),
		value: null,
		candidate: new Array(order),
		numEvaluations: 0,
		...options,
		nominalsIndexes,
		nominalsSubdomain,
		nominalsStateFlux,
		integersIndexes,
		integersSubdomain,
		integersStateFlux,
		integersSearchCache: new Map(),
		integersSearchCacheMaxSize: 0,
		realsIndexes,
		realsSubdomain,
		realsStateFlux,
		evaluateFlux,
	}

	_searchNominals(state)
		.then(() => {
			state.done = true
			nominalsStateFlux.settle(null)
			integersStateFlux.settle(null)
			realsStateFlux.settle(null)
			evaluateFlux.settle(null)
		})

	await evaluateFlux.promise()
	return state
}

const _searchNominals = async (state) => {
	const {
		nominalsIndexes,
		nominalsSubdomain,
		nominalsStateFlux,
		candidate,
	} = state

	const nominalsOrder = nominalsSubdomain.length
	if (nominalsOrder === 0) {
		return await _searchIntegers(state)
	}

	const nominalsState = await ExhaustiveSearch.init({
		order: nominalsOrder,
		domain: nominalsSubdomain,
		func: serialized(async (...args) => {
			for (let i = 0; i < nominalsOrder; i++) {
				const index = nominalsIndexes[i]
				const value = args[i]
				candidate[index] = value
			}

			return await _searchIntegers(state)
		}),
	})

	nominalsStateFlux.settle(nominalsState)

	while (!nominalsState.done) {
		await ExhaustiveSearch.iter(nominalsState)
	}

	nominalsStateFlux.unsettle()
	return ExhaustiveSearch.best(nominalsState).value
}

const _searchIntegers = async (state) => {
	const {
		integersIndexes,
		integersSubdomain,
		integersStateFlux,
		integersSearchCache,
		candidate,
	} = state

	const integersOrder = integersSubdomain.length
	if (integersOrder === 0) {
		return await _searchReals(state)
	}

	const cacheKeyParts = new Array(integersOrder)

	const integersState = await PatternSearch.init({
		order: integersOrder,
		domain: integersSubdomain,
		func: serialized(async (...args) => {
			for (let i = 0; i < integersOrder; i++) {
				const index = integersIndexes[i]
				const value = args[i]
				candidate[index] = value
				cacheKeyParts[i] = value
			}

			const cacheKey = cacheKeyParts.join(',')
			const cached = integersSearchCache.get(cacheKey)
			if (cached !== undefined) { return cached }

			const result = await _searchReals(state)

			integersSearchCache.set(cacheKey, result)
			state.integersSearchCacheMaxSize = Math.max(
				state.integersSearchCacheMaxSize,
				integersSearchCache.size,
			)
			return result
		}),
	})

	for (const vector of integersState.vectors) {
		map$$$(vector, roundUp)
	}

	integersStateFlux.settle(integersState)

	for (;;) {
		await PatternSearch.iter(integersState)

		const { vectors, countFailed } = integersState

		if (countFailed > 0) {
			const maxNormSquared = max(map(vectors, V.normSquared))
			if (maxNormSquared === 1) { break }

			for (const vector of vectors) {
				map$$$(vector, (x) => roundUp(x / 2))
			}
		}
		else {
			for (const vector of vectors) {
				map$$$(vector, (x) => roundUp(x * 1.5))
			}
		}
	}

	integersStateFlux.unsettle()
	integersSearchCache.clear()
	return PatternSearch.best(integersState).value
}

const _searchReals = async (state) => {
	const {
		realsIndexes,
		realsSubdomain,
		realsStateFlux,
		candidate,
		limit,
	} = state

	const realsOrder = realsSubdomain.length
	if (realsOrder === 0) {
		return await _evaluate(state)
	}

	const realsState = await NelderMead.init({
		order: realsOrder,
		domain: realsSubdomain,
		func: serialized(async (...args) => {
			for (let i = 0; i < realsOrder; i++) {
				const index = realsIndexes[i]
				const value = args[i]
				candidate[index] = value
			}

			return await _evaluate(state)
		}),
	})

	realsStateFlux.settle(realsState)

	for (;;) {
		await NelderMead.iter(realsState)
		if (await limit(state)) { break }
	}

	realsStateFlux.unsettle()
	return NelderMead.best(realsState).value
}

const _evaluate = async (state) => {
	const { evaluateFlux, candidate, func } = state

	evaluateFlux.settle(null)
	evaluateFlux.unsettle()
	await evaluateFlux.promise()

	const value = await func(...candidate)
	state.numEvaluations++

	if (value < state.value || state.value === null) {
		state.value = value
		copy$$$(state.solution, candidate)
	}

	return value
}

const iter = async (state) => {
	const { done, evaluateFlux } = state
	if (done) { return }
	evaluateFlux.settle(null)
	evaluateFlux.unsettle()
	await evaluateFlux.promise()
}

const best = (state) => ({
	solution: state.solution,
	value: state.value,
})


const search = async ({ func, domain, limit }) => {
	const state = await init({ func, domain, order: domain.length }, { limit })
	while (!state.done) { await iter(state) }
	return best(state)
}


module.exports = {
	init,
	iter,
	best,
	search,
}
