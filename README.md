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

Request API is intented to be as close to [axios](https://github.com/axios/axios) API as possible.

```js
// Send a POST request
escherRequest.request({
  method: 'post',
  url: '/user/12345',
  data: {
    firstName: 'Fred',
    lastName: 'Flintstone'
  }
});
```

There is an extra `escherKeyId` option, which let you make calls with relative urls:

```js
escherRequest.get('/hello', { escherKeyId: 'test_test-target' })
```

This allows you to write environment independent code more easily.
You only have to change the value of the `ESCHER_INTEGRATIONS` environment variable
between environments, and your requests will go to the correct destination signed with
the correct credentials.

The plan is to support most of axios's config options.
So far `url, method, headers, timeout, maxContentLength, maxRedirects` is known to work.
Feel free to experiment with the other ones, they might work (expect `params`, that will
not work yet for sure).

#### Request method aliases
- escherRequest.get(url[, config])
- escherRequest.delete(url[, config])
- escherRequest.head(url[, config])
- escherRequest.options(url[, config])
- escherRequest.post(url[, data[, config]])
- escherRequest.put(url[, data[, config]])
- escherRequest.patch(url[, data[, config]])


### Presign URL

### Validate request
