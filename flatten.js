const EXPANSIONS = [
  "author_id",
  "in_reply_to_user_id",
  "referenced_tweets.id",
  "referenced_tweets.id.author_id",
  "entities.mentions.username",
  "attachments.poll_ids",
  "attachments.media_keys",
  "geo.place_id",
]

const USER_FIELDS = [
  "created_at",
  "description",
  "entities",
  "id",
  "location",
  "name",
  "pinned_tweet_id",
  "profile_image_url",
  "protected",
  "public_metrics",
  "url",
  "username",
  "verified",
  "withheld",
]

const TWEET_FIELDS = [
  "attachments",
  "author_id",
  "context_annotations",
  "conversation_id",
  "created_at",
  "entities",
  "geo",
  "id",
  "in_reply_to_user_id",
  "lang",
  "public_metrics",
  // "non_public_metrics", private
  // "organic_metrics",  private
  // "promoted_metrics",  private
  "text",
  "possibly_sensitive",
  "referenced_tweets",
  "reply_settings",
  "source",
  "withheld",
]

const MEDIA_FIELDS = [
  "alt_text",
  "duration_ms",
  "height",
  "media_key",
  "preview_image_url",
  "type",
  "url",
  "width",
  // "non_public_metrics", private
  // "organic_metrics", private
  // "promoted_metrics", private
  "public_metrics",
]

const POLL_FIELDS = ["duration_minutes", "end_datetime", "id", "options", "voting_status"]

const PLACE_FIELDS = [
  "contained_within",
  "country",
  "country_code",
  "full_name",
  "geo",
  "id",
  "name",
  "place_type",
]

EVERYTHING = {
  "expansions": EXPANSIONS.join(","),
  "user.fields": USER_FIELDS.join(","),
  "tweet.fields": TWEET_FIELDS.join(","),
  "media.fields": MEDIA_FIELDS.join(","),
  "poll.fields": POLL_FIELDS.join(","),
  "place.fields": PLACE_FIELDS.join(","),
}

function extractIncludes(response, expansion, _id="id") {
  const includes = {}
  if (response.includes && response.includes[expansion]) {
    for (include of response.includes[expansion]) {
      includes[include[_id]] = include
    }
  }
  return includes
}

function flatten(response) {

  // users need to be looked up by user and id
  const includes_users = {
    ...extractIncludes(response, "users", "id"),
    ...extractIncludes(response, "users", "username"),
  }

  // Media is by media_key, not id
  const includesMedia = extractIncludes(response, "media", "media_key")
  const includesPolls = extractIncludes(response, "polls")
  const includesPlaces = extractIncludes(response, "places")
  
  // Tweets in includes will themselves be expanded
  const includesTweets = extractIncludes(response, "tweets")

  function expandPayload(payload) {

    // Don't try to expand on primitive values, return strings as is:
    if (["string", "boolean", "number"].indexOf(typeof(payload)) != -1) {
      return payload
    }

    // expand list items individually:
    else if (Array.isArray(payload)) {
      return payload.map(item => expandPayload(item))
    }

    // Try to expand on dicts within dicts:
    else if (typeof(payload) == "object") {
      for (const key in payload) {
        payload[key] = expandPayload(payload[key])
      }
    }

    if (payload.author_id) {
      payload.author = includes_users[payload.author_id]
    }

    if (payload.in_reply_to_user_id) {
      payload.in_reply_to_user = includes_users[payload.in_reply_to_user_id]
    }

    if (payload.media_keys) {
      payload.media = payload.media_keys.map(k => includesMedia[k])
    }

    if (payload.poll_ids && payload.poll_ids.length > 0) {
      const poll_id = payload["poll_ids"][0]
      payload.poll = includesPolls[poll_id]
    }

    if (payload.geo && payload.geo.place_id) {
      const place_id = payload.geo.place_id
      payload.geo = {
        ...payload.geo,
        ...includesPlaces[place_id]
      }
    }

    if (payload.mentions) {
      payload.mentions = payload.mentions.map(user => ({
        ...user,
        ...includes_users[user.username]
      }))
    }

    if (payload.referenced_tweets) {
      payload["referenced_tweets"] = payload.referenced_tweets.map(tweet => ({
        ...tweet,
        ...includesTweets[tweet.id]
      }))
    }

    if (payload.pinned_tweet_id) {
      payload.pinned_tweet = includesTweets[payload.pinned_tweet_id]
    }

    return payload
  }

  // expand the tweets in "includes", before processing actual result tweets
  for (const [id, tweet] of Object.entries(extractIncludes(response, "tweets"))) {
    includesTweets[id] = expandPayload(tweet)
  }

  // expand the list of tweets or an individual tweet in "data"
  let tweets = []
  if (response.data) {
    const data = response["data"]

    if (Array.isArray(data)) {
      tweets = expandPayload(response["data"])
    } else if (typeof(data) == "object") {
      tweets = [expandPayload(response["data"])]
    }
  }

  return tweets
}

module.exports = flatten

