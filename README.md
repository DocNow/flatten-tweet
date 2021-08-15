# flatten-tweet

## Install

    npm install flatten-tweet

## Use

flatten-tweet is designed to be used to transform the data received from the
Twitter v2 API to make it easier to work with. It is not a client itself, so
you'll need to use something that gives you the raw JSON response (e.g. like
[twitter-v2]).

The value in having a separate function to flatten data is that other libraries
and/or projects can import and use it as needed no matter how the data is being
fetched.

When new expansions or includes are added changed *flatten-tweet* will be
updated to include them. [semver] will be used to version the NPM package, with
respect to the flatten-tweet JavaScript API (which is pretty simple) but also
with respect to the Twitter API. So if a new expansion or field is added you
can expect a minor version increment. Any backwards incompatible changes will
get a new major version.

```javascript

import flatten from 'flatten-tweet'
import Twitter from 'twitter-v2'

const client = new Twitter(credentials)
const data = await client.get('tweets/search/recent', {query: 'from:jack'})

// flatten it!

const flattened = flatten(data)
```

## Huh?

You might be wondering why you would ever want to use flatten-tweet. Let me
explain...

Rather than including all the available information for a tweet Twitter's v2
API now includes [expansions] which allow you to request additional information
like user, media, quoted/retweeted tweets, etc. This additional information is
not included inline in the tweet objects themselves but as an additional JSON
stanza of `includes`.

The `includes` stanza cuts down on potential duplication in the response.
For example the information about a tweet that is retweeted many times in
the tweets contained in the response, is only included once, and
everywhere else in the response it is referenced using its tweet id.

But the `includes` stanza also makes processing retrieved Twitter data
a bit more difficult. If you are looking at a tweet and want to know when
the tweet author's account was created you can't simply use
`tweet.author.created_at`. You need to get the `tweet.author_id` and then
search through the `includes.users` list looking for it, and then use
that.

To simplify this process the `flatten()` function included here will take
an API response, and will copy the includes into all the tweets that
reference them.

So now when you are processing a tweet instead of having to work with a tweet
that looks (in abbreviated form) like this:

```json
{
  "data": [
    {
      "id": "21",
      "text": "just setting up my twttr",
      "author_id": "12"
    }
  ],
  "includes": {
    "users": [
      {
        "id": "123",
        "username": "jack",
        "created_at": "2006-03-21T20:50:14.000Z"
      }
    ]
  }
}
```

after flattening you will have:

```json
{
  "data": [
    {
      "id": "21",
      "text": "just setting up my twttr",
      "author_id": "12",
      "author": {
        "id": "12",
        "username": "jack",
        "created_at": "2006-03-21T20:50:14.000Z",
      }
    }
  ]
}
```

This JavaScript is a port of the [equivalent Python function] in [twarc].

[expansions]: https://developer.twitter.com/en/docs/twitter-api/expansions
[twarc]: https://github.com/docnow/twarc
[equivalent Python function]: https://github.com/DocNow/twarc/blob/main/twarc/expansions.py
[semver]: https://semver.org
[twitter-v2]: https://github.com/HunterLarco/twitter-v2
