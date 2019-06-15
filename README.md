# escher-request

We wanted to make it easier to work with escher requests, so this packgage provides a alternative to using packages like `escher-suiteapi-js`, `escher-auth`, `escher-keypool` and `koa-escher-auth`.

## Setup

For `escher-request` to work, you have to have a sing `ESCHER_INTEGRATIONS` environemnt
variable set with all your escher related secrets and stuff.

```js
process.env.ESCHER_INTEGRATIONS = `[
  {
    "serviceUrl": "http://www.example.com:8080",
    "credentialScope": "eu/test-target/ems_request",
    "keyId": "test_test-target_v1",
    "secret": "secret",
    "acceptOnly": false
  }
]`;
```

For each service you want to communicate with include an object in the array with these params:
- `serviceUrl` is the base url of the service
- `credentialScope` will be set in auth header when sending a request towards the service
- `keyId` will be also sent, the receiving party will use this to look up the secret
- `secret` this will be used to generate and validate the signature
- `acceptOnly` makes it easier to rotate your keys. When it's `true` it will only
be used to validate incoming requests, and you can have a second entry for this service with
the new `secret`, `v2` keyId and `acceptOnly` as `false` which will be used for outgoing ones.

## API

### Making request

##### escherRequest.requst(config)

The plan is to have the same interface for config object as [axios](https://github.com/axios/axios).
`url, method, headers, timeout, maxContentLength, maxRedirects` options should work,
feel free to experiment with the other ones, they might work (expect `params`, that will
not work yet for sure).

### Presign URL

### Validate request
