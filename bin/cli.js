#!/usr/bin/env node

const fs = require('fs')
const { flatten } = require('../index')

function main() {
  const jsonFile = process.argv[2]
  if (! jsonFile) {
    console.error('usage: flatten-tweet <file>')
  } else if (! fs.existsSync(jsonFile)) {
    console.error(`file does not exist: ${jsonFile}`)
  } else {
    const data = fs.readFileSync(jsonFile, 'utf-8')
    try {
      const payload = JSON.parse(data)
      const flat = flatten(payload)
      console.log(JSON.stringify(flat, null, 2))
    } catch(err) {
      console.error(`invalid JSON: ${err}`)
    }
  }
}

if (require.main === module) {
  main()
}
