const { ok } = require("assert")
const flatten = require("./index.js")
const response = require("./test-data/response.json")

describe("flatten", () => {

  it("tweet has no author", () => {
    ok(! response.data[0].author, "author missing")
  })

  it("flattened tweet has an author", () => {
    const flat = flatten(response)
    ok(flat.data[0].author.username, "author found")
  })

  // probably should test more things here!?

})
