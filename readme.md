# type_is

[![tag](https://img.shields.io/github/tag/ako-deno/type_is.svg)](https://github.com/ako-deno/type_is/tags)
![type_is-ci](https://github.com/ako-deno/type_is/workflows/type_is-ci/badge.svg)
[![HitCount](http://hits.dwyl.com/ako-deno/type_is.svg)](http://hits.dwyl.com/ako-deno/type_is)

Infer the content-type of a HTTP Header for Deno, compatible with Browser. Based on `https://github.com/jshttp/type-is`.

## API

```js
import { is, typeofrequest, hasBody } from "https://deno.land/x/type_is/mod.ts";

```

### is(mediaType: string, types?: string[]): boolean | string

Checks if the `mediaType` is one of the `types`. If the `mediaType` is invalid
or does not matches any of the `types`, then `false` is returned. Otherwise, a
string of the type that matched is returned.

The `mediaType` argument is expected to be a
[media type](https://tools.ietf.org/html/rfc6838) string. The `types` argument
is an array of type strings.

Each type in the `types` array can be one of the following:

- A file extension name such as `json`. This name will be returned if matched.
- A mime type such as `application/json`.
- A mime type with a wildcard such as `*/*` or `*/json` or `application/*`.
  The full mime type will be returned if matched.
- A suffix such as `+json`. This can be combined with a wildcard such as
  `*/vnd+json` or `application/*+json`. The full mime type will be returned
  if matched.

Some examples to illustrate the inputs and returned value:

```js
const mediaType = 'application/json'

is(mediaType, ['json']) // => 'json'
is(mediaType, ['html', 'json']) // => 'json'
is(mediaType, ['application/*']) // => 'application/json'
is(mediaType, ['application/json']) // => 'application/json'

is(mediaType, ['html']) // => false
```

### typeofrequest(header: Headers, types?: string[]): null | boolean | string

Checks if the `header` is one of the `types`. If the header's request has no body,
even if there is a `Content-Type` header, then `null` is returned. If the
`Content-Type` header is invalid or does not matches any of the `types`, then
`false` is returned. Otherwise, a string of the type that matched is returned.

The `header` argument is expected to be a Deno's Headers, it should be compatible with browser's Headers as well. The `types` argument is an array of type strings.

Each type in the `types` array can be one of the following:

- A file extension name such as `json`. This name will be returned if matched.
- A mime type such as `application/json`.
- A mime type with a wildcard such as `*/*` or `*/json` or `application/*`.
  The full mime type will be returned if matched.
- A suffix such as `+json`. This can be combined with a wildcard such as
  `*/vnd+json` or `application/*+json`. The full mime type will be returned
  if matched.

Some examples to illustrate the inputs and returned value:

```js
const header = new Headers([["content-type", "application/json"]]);

typeis(header, ["json"]) // => "json"
typeis(header, ["html", "json"]) // => "json"
typeis(header, ["application/*"]) // => "application/json"
typeis(header, ["application/json"]) // => "application/json"
typeis(header, ["html"]) // => false
```

Example in Deno http server:

```js
import {
  serve
} from "https://deno.land/std/http/server.ts";
import { typeofrequest } from "https://raw.githubusercontent.com/ako-deno/type_is/master/mod.ts";

const server = serve("127.0.0.1:4500");

for await (const req of server) {
  const isText = typeofrequest(req.headers, ['text/*'])
  const res = {
    body: `you ${istext ? 'sent' : 'did not send'} me text`,
    headers: new Headers(),
  };
  req.respond(res).catch(() => {});
}
```

### hasBody(header: Headers): boolean

Returns a Boolean if the given header's `request` has a body, regardless of the
`Content-Type` header.

Having a body has no relation to how large the body is (it may be 0 bytes).
This is similar to how file existence works. If a body does exist, then this
indicates that there is data to read from the Deno's request stream.

# License

[MIT](./LICENSE)
