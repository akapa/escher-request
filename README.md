# escher-request

We wanted to make it easier to work with escher requests.
This package provides a alternative to using packages like `escher-suiteapi-js`, `escher-auth`, `escher-keypool` and `koa-escher-auth`.

## Setup

For `escher-request` to work, you should set `ESCHER_INTEGRATIONS` environment
variable set with all your escher related config.

For compatibility reasons `ESCHER_KEY_POOL` and `SUITE_ESCHER_KEY_POOL` variables are also supported
for storing config.

```js
process.env.ESCHER_INTEGRATIONS = `[
  {
    "keyId": "test_test-sender_v1",
    "secret": "code"
  }
  {
    "keyId": "test_test-target_v1",
    "secret": "secret",
    "serviceUrl": "http://www.example.com:8080",
    "credentialScope": "eu/test-target/ems_request"
  }
]`;
```

For each service you want to communicate with include an object in the array with these params:
- `keyId` sent with outgoing request, used during authentication to look up the matching secret
- `secret` used to generate and validate the signature
- `serviceUrl` _(optional)_ base url of the service (needed for outgoing requests)
- `credentialScope` _(optional)_ will be set in auth header when sending a request towards the service (needed for outgoing requests)
- `acceptOnly` _(optional, default `false`)_ makes it easier to rotate your keys. When it's `true` it will only
be used to validate incoming requests, and you can have a second entry for this service with
the new `secret`, version two (`..._v2`) key id and `acceptOnly` as `false` which will be used for outgoing ones.

## API

### Making a request

Request API is intended to be as close to [axios](https://github.com/axios/axios) API as possible.

```js
// Send a POST request
escherRequest.request({
  method: 'post',
  url: 'http://somewhere.com/user/12345',
  data: {
    firstName: 'Fred',
    lastName: 'Flintstone'
  }
})
```

The main difference is that only absolute url work, as the origin part of the url will be used
to look up the escher `keyId` and `secret` set up in `ESCHER_INTEGRATIONS` for signing the request.

There is also an extra `escherKeyId` option, which lets you make calls with relative urls.
In this case this `keyId` will be used to look up the `serviceUrl` of the target which will
be prepended to the url.

```js
escherRequest.get('/hello', { escherKeyId: 'test_test-target' })
```

Omit version information from the end of the key for this config (eg: `key` instead of `key_v1`)).

This allows you to write environment independent code more easily.
You only have to change the value of the `ESCHER_INTEGRATIONS` environment variable
between environments, and your requests will go to the correct destination signed with
the correct credentials.

If you would like to use the package without `ESCHER_INTEGRATIONS` environment variable, you can
explicitly pass in `escherCredentialScope` and `escherSecret` in config, which will be used
to generate the authentication headers. For this special use case version information have to
be included in the key, and only absolue url can be used.

```js
escherRequest.get('http://localhost:45345/hello', {
  escherKeyId: 'test_test-target_v1',
  escherCredentialScope: 'eu/hap/ems_request',
  escherSecret: 'secret'
});
```

The plan is to support most of axios's config options. `url`, `method`, `headers`, `data`,
`params` and `paramsSerializer` options are pre-processed, since they have direct impact
on the escher signature to be generated. All other options are passed down to axios unchanged.

One noticable difference from the default options of `axios` is the default value for
`timeout` option. It is 25052 ms, while in `axios` it is 0 (no timeout).

#### Request method aliases
- escherRequest.get(url[, config])
- escherRequest.delete(url[, config])
- escherRequest.head(url[, config])
- escherRequest.options(url[, config])
- escherRequest.post(url[, data[, config]])
- escherRequest.put(url[, data[, config]])
- escherRequest.patch(url[, data[, config]])


### Pre-signing an URL

Pre-signs an url with given expiration (in second, by default it is 86400 secs, aka 24 hours).
Mostly useful for ui handshake requests or integrating an iframe into a front-end.

```js
escherRequest.preSignUrl(
  'http://www.example.com/etwas?a=4',
  { expires: 300 }
)
```

```js
escherRequest.preSignUrl(
  '/etwas?a=4',
  { expires: 300, escherKeyId: 'test_test-target' }
)
```

### Authenticate

When passed in the credentialScope of the service and parameters of a received request, returns
whether it passes authentication or not (correct `credentialScope`, `keyId`, `secret`, etc is used).

```js
const { authenticated, message } = escherRequest.authenticate(
  'eu/test-target/ems_request',
  {
    method: 'POST',
    url: '/puty',
    headers: {
      'content-type': 'application/json',
      host: 'localhost:9193',
      'x-ems-date': '20190616T183748Z',
      'x-ems-auth': 'EMS-HMAC-SHA256 Credential=test_test-target_v1 ...'
    },
    body: '{"duckling":4}'
  }
)
```

`autheticated` is boolean, shows whether it passed authentication or not, `message`
contains a reason if it did not.

Usually you want to wrap this method in a middlaware that handles the specifics of your
favorite framework.

See examples for ideas how this could be done: [koa](examples/koa.js),
[koa-with-badyparser](examples/koa-with-bodyparser.js), [express](examples/express.js), [express-with-bodyparser](examples/express-with-bodyparser)

## Contributing

This package is currently maintained by @mkls. Feel free to reach out with problems, suggestions
or anything through github issues.

Pull requests are always welcome, just follow our ordinal commit message convention.

Creating a new release:
- make your changes
- update version information in package.json
- document what was changed in CHANGELOG.md
- run `npm publish`