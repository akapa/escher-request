'use strict';

const Escher = require('escher-auth');
const axios = require('axios');
const { URL } = require('url');
const _ = require('lodash');

const emsEscherConstants = {
  algoPrefix: 'EMS',
  vendorKey: 'EMS',
  authHeaderName: 'X-Ems-Auth',
  dateHeaderName: 'X-Ems-Date'
};

exports.request = async config => {
  config = {
    method: 'get',
    url: '',
    timeout: 15000,
    ...config
  };

  const { url, integration } = getUrlAndIntegration(config.url, config.escherKeyId);

  const headers = {
    ...config.headers,
    'content-type': 'application/json',
    host: url.host
  };
  const data = config.data ? JSON.stringify(config.data) : undefined;
  const method = config.method;

  const headersWithAuth = addAuthHeaders({ integration, method, url, data, headers });

  const response = await axios.request({
    ...config,
    method,
    url: url.href,
    data,
    headers: headersWithAuth
  });
  return _.omit(response, 'request');
};

exports.delete = async (url, config = {}) => exports.request({ ...config, method: 'delete', url });
exports.get = async (url, config = {}) => exports.request({ ...config, method: 'get', url });
exports.head = async (url, config = {}) => exports.request({ ...config, method: 'head', url });
exports.options = async (url, config = {}) => exports.request({ ...config, method: 'options', url });
exports.post = async (url, data, config = {}) => exports.request({ ...config, method: 'post', url, data });
exports.put = async (url, data, config = {}) => exports.request({ ...config, method: 'put', url, data });
exports.patch = async (url, data, config = {}) => exports.request({ ...config, method: 'patch', url, data });

exports.preSignUrl = (urlParam, { expires = 86400, escherKeyId = null }) => {
  const { url, integration } = getUrlAndIntegration(urlParam, escherKeyId);
  const escher = getEscherForIntegration(integration);
  return escher.preSignUrl(url.href, expires) + url.hash;
};

exports.authenticate = (credentialScope, { method, url, headers, body }) => {
  const escher = new Escher({ credentialScope, ...emsEscherConstants });

  try {
    escher.authenticate({ method, url, headers, body }, keyDbForAuthenticate);
    return { authenticated: true };
  } catch (error) {
    return { authenticated: false, message: error.message };
  }
};

const getUrlAndIntegration = (urlParam, escherKeyId) => {
  if (urlParam.startsWith('http')) {
    const url = new URL(urlParam);
    const integration = findIntegrationByUrl(url.origin);
    return { url, integration };
  } else {
    const integration = findIntegrationByEscherKey(escherKeyId);
    const url = new URL(integration.serviceUrl + urlParam);
    return { url, integration };
  }
};

const addAuthHeaders = ({ integration, method, url, data, headers }) => {
  const escher = getEscherForIntegration(integration);

  const headersToSign = Object.keys(headers);
  const signedRequest = escher.signRequest(
    {
      method: method.toUpperCase(),
      url: url.pathname + url.search,
      headers: _.toPairs(headers)
    },
    data || '',
    headersToSign
  );
  return _.fromPairs(signedRequest.headers);
};

const getEscherForIntegration = integration => new Escher({
  accessKeyId: integration.keyId,
  apiSecret: integration.secret,
  credentialScope: integration.credentialScope,
  ...emsEscherConstants
});

const findIntegrationByUrl = urlOrigin => {
  const integrations = JSON.parse(process.env.ESCHER_INTEGRATIONS);
  return integrations.find(integration => integration.serviceUrl === urlOrigin)
};

const findIntegrationByEscherKey = escherKeyId => {
  const integrations = JSON.parse(process.env.ESCHER_INTEGRATIONS);
  return integrations
    .filter(integration => !integration.acceptOnly)
    .find(integration => integration.keyId.replace(/_v\d+/, '') === escherKeyId);
};

const keyDbForAuthenticate = escherKeyId => {
  const integrations = JSON.parse(process.env.ESCHER_INTEGRATIONS);
  return integrations.find(integration => integration.keyId === escherKeyId).secret;
}