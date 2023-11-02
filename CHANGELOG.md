# Changelog

[npm history](https://www.npmjs.com/package/escher-request?activeTab=versions)

## v1.3.0
- updated packages

## v1.2.0
- add a new, undocumented method: getServiceUrlForEscherKeyId. Can be used in tests where you want
to mock an escher request but do not want to hardcode the service url twice.

## v1.1.10
- update axios to latest

## v1.1.9
- update packages, get rid of package-lock.json and no longer fix down dependencies

## v1.1.8
- update lodash to fix audit warning

## v1.1.7
- fix typos

## v1.1.5
- update axios dependency to fix audit warning

## v1.1.4
- throw more descriptive error when called with an escher key not found in integrations

## v1.1.3
- update outdated dependencies

## v1.1.2

### Config
- Increased default timeout of requests. (No timeout can be achieved with passing in 0 as timeout).

## v1.1.1 (2019-08-29)

### Documentation
- Note in documentation that only absolute urls work

## v1.1.0 (2019-07-17)

### Features
- `escherCredentialScope` and `escherSecret` can be explicitly passed in when making request.
