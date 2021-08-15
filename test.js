// NOTE: you'll need to install twitter-v2 and set BEARER_TOKEN in 
// your environment for these tests to work!

const { ok } = require("assert")
const { flatten, EVERYTHING } = require("./index.js")
const Twitter = require('twitter-v2')

let response = null

describe("flatten", () => {

  it("flatten-tweet has flatten", () => {
    ok(typeof(flatten, "function"))
  })

  it("flatten-tweet has EVERYTHING params", () => {
    ok(typeof(EVERYTHING, "object"))
    ok(typeof(EVERYTHING.expansions, "string"))
  })

  it("environment has BEARER_TOKEN", () => {
    ok(process.env.BEARER_TOKEN)
  })

  it("can get data from the Twitter API", async () => {
    const client = new Twitter({
      bearer_token: process.env.BEARER_TOKEN
    })

    response = await client.get('tweets/search/recent', {
      ...EVERYTHING,
      query: 'from:jack'
    })

    ok(response)
  })

  it("tweet has no author", () => {
    ok(! response.data[0].author, "author missing")
  })

  it("flattened tweet has an author!", () => {
    const flat = flatten(response)
    ok(flat.data[0].author.username, "author found")
  })

  // probably should test more things eh ?!?

})
