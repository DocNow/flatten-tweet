# flatten

Rather than including all the available information for a tweet Twitter's v2
API now includes [expansions] which allow you to request additional information
like user, media, quoted/retweeted tweets, etc. This additional information is
not included inline in the tweet objects themselves but as an additional JSON
stanza of *includes*.

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

This JavaScript is a port of the [equivalent Python function] in [twarc].

[expansions]: https://developer.twitter.com/en/docs/twitter-api/expansions
[twarc]: https://github.com/docnow/twarc
[equivalent Python function]: https://github.com/DocNow/twarc/blob/main/twarc/expansions.py
