// a simple demo of importing & using the flatten function

const flatten = require('./flatten.js')
const data = require('./response.json')

// output flattened response as JSON (2 space indents)

console.log(
  JSON.stringify(
    flatten(data),
    null,
    2
  )
)
