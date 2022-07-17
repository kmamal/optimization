const SimpleTestFunctions = require('./test-functions/simple')

const { __linearSearch } = require('../linear')

const ORDER = 2

const problems = Object
	.entries(SimpleTestFunctions)
	.map(([ name, make ]) => ({
		name,
		value: make(ORDER),
	}))

const algos = [
	{
		name: "Coordinate Descent",
		value: coordinateDescent,
	},
]

const limits = { eps: 1e-4 }

const toCsv = (values) => values
	.map((value) => typeof value === 'string'
		? `"${value.replace(/"/ug, '\\"')}"`
		: value)
	.join(',')


const keys = [ "Problem", ...algos.map(({ name }) => name) ]
console.log(toCsv(keys))

for (const problem of problems) {
	const results = [ problem.name ]
	for (const algo of algos) {
		const result = algo(problem.value, limits).value
		results.push(result)
	}
	console.log(toCsv(results))
}
