const ExhaustiveSearch = require('./exhaustive-search')
const PatternSearch = require('./pattern-search')
const NelderMead = require('./nelder-mead')

const { Flux } = require('@kmamal/async/flux')
const { serialized } = require('@kmamal/util/function/async/serialized')

const { copy } = require('@kmamal/util/array/copy')
const { create } = require('@kmamal/util/array/create')

const copy$$$ = copy.$$$


const init = async ({ domain, func }, { limitReals, ...options }) => {
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

	const evaluateFlux = new Flux()

	const order = domain.length
	const state = {
		order,
		domain,
		func,
		limitReals,
		done: false,
		solution: new Array(order),
		value: null,
		candidate: new Array(order),
		numEvaluations: 0,
		...options,
		nominalsIndexes,
		nominalsSubdomain,
		nominalsState: null,
		integersIndexes,
		integersSubdomain,
		integersState: null,
		integersSearchCache: new Map(),
		integersSearchCacheMaxSize: 0,
		realsIndexes,
		realsSubdomain,
		realsState: null,
		evaluateFlux,
	}

	_searchNominals(state)
		.then(() => {
			state.done = true
			state.nominalsState = null
			state.integersState = null
			state.realsState = null
			evaluateFlux.settle(null)
		})

	await evaluateFlux.promise()
	return state
}

const _searchNominals = async (state) => {
	const {
		nominalsIndexes,
		nominalsSubdomain,
		candidate,
		initial,
	} = state

	const nominalsOrder = nominalsSubdomain.length
	if (nominalsOrder === 0) {
		return await _searchIntegers(state)
	}

	const nominalsInitial = initial != null ? {
		solution: create(nominalsOrder, (i) => initial.solution[nominalsIndexes[i]]),
		value: initial.value,
	} : undefined

	const nominalsState = await ExhaustiveSearch.init({
		func: serialized(async (args) => {
			for (let i = 0; i < nominalsOrder; i++) {
				const index = nominalsIndexes[i]
				const value = args[i]
				candidate[index] = value
			}

			return await _searchIntegers(state)
		}),
		domain: nominalsSubdomain,
	}, { initial: nominalsInitial })

	state.nominalsState = nominalsState

	while (!nominalsState.done) {
		await ExhaustiveSearch.iter(nominalsState)
	}

	state.nominalsState = null
	return ExhaustiveSearch.best(nominalsState).value
}

const _searchIntegers = async (state) => {
	const {
		integersIndexes,
		integersSubdomain,
		integersSearchCache,
		candidate,
		initial,
	} = state

	const integersOrder = integersSubdomain.length
	if (integersOrder === 0) {
		return await _searchReals(state)
	}

	const integersInitial = initial != null ? {
		solution: create(integersOrder, (i) => initial.solution[integersIndexes[i]]),
		value: initial.value,
	} : undefined

	const cacheKeyParts = new Array(integersOrder)

	const integersState = await PatternSearch.init({
		order: integersOrder,
		domain: integersSubdomain,
		func: serialized(async (args) => {
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
	}, { initial: integersInitial })

	PatternSearch.roundVectors(integersState)

	state.integersState = integersState

	for (;;) {
		await PatternSearch.iter(integersState)
		if (PatternSearch.didFailAndVectorsConvergeTo(integersState, 1)) { break }
		PatternSearch.adjustVectorsRounded(integersState, 0.5, 1.5)
	}

	integersSearchCache.clear()
	state.integersState = null
	return PatternSearch.best(integersState).value
}

const _searchReals = async (state) => {
	const {
		realsIndexes,
		realsSubdomain,
		candidate,
		limitReals,
		initial,
	} = state

	const realsOrder = realsSubdomain.length
	if (realsOrder === 0) {
		return await _evaluate(state)
	}

	const realsInitial = initial != null ? {
		solution: create(realsOrder, (i) => initial.solution[realsIndexes[i]]),
		value: initial.value,
	} : undefined

	const realsState = await NelderMead.init({
		func: serialized(async (args) => {
			for (let i = 0; i < realsOrder; i++) {
				const index = realsIndexes[i]
				const value = args[i]
				candidate[index] = value
			}

			return await _evaluate(state)
		}),
		domain: realsSubdomain,
	}, { initial: realsInitial })

	state.realsState = realsState

	for (;;) {
		await NelderMead.iter(realsState)
		if (limitReals(state)) { break }
	}

	state.realsState = null
	return NelderMead.best(realsState).value
}

const _evaluate = async (state) => {
	const { evaluateFlux, candidate, func } = state

	evaluateFlux.settle(null)
	evaluateFlux.unsettle()
	await evaluateFlux.promise()

	const value = await func(candidate)
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


const search = async ({ problem, limitReals, options }) => {
	const state = await init(
		problem,
		{ ...options, limitReals },
	)
	while (!state.done) { await iter(state) }
	return best(state)
}

const stopWhenRealsConvergeTo = (tolerance) =>
	(state) => NelderMead.stopWhenPointsConvergeTo(tolerance)(state.realsState)


module.exports = {
	init,
	iter,
	best,
	search,
	stopWhenRealsConvergeTo,
}
