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
  config = { timeout: 25052, ...config };

  const { absoluteUrl, integration } = getAbsolutUrlAndIntegration(config);
  const urlWithParams = axios.getUri({
    url: absoluteUrl,
    ..._.pick(config, ['params', 'paramsSerializer'])
  });
  const url = new URL(urlWithParams);

  const headers = {
    ...config.headers,
    'content-type': 'application/json',
    host: url.host
  };
  const data = config.data ? JSON.stringify(config.data) : undefined;
  const relativeUrl = url.pathname + url.search;
  const method = config.method;

  const headersWithAuth = addAuthHeaders({ integration, method, relativeUrl, data, headers });

  const response = await axios.request({
    ..._.omit(config, ['params', 'paramsSerializer']),
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

exports.preSignUrl = (url, { expires = 86400, escherKeyId = null }) => {
  const { absoluteUrl, integration } = getAbsolutUrlAndIntegration({ url, escherKeyId });
  const escher = getEscherForIntegration(integration);
  return escher.preSignUrl(absoluteUrl, expires);
};

exports.authenticate = (credentialScope, { method, url, headers, body }) => {
  const escher = new Escher({ credentialScope, ...emsEscherConstants });

  try {
    const accessKeyId = escher.authenticate({ method, url, headers, body }, keyDbForAuthenticate);
    return { authenticated: true, accessKeyId };
  } catch (error) {
    return { authenticated: false, message: error.message };
  }
};

exports.getServiceUrlForEscherKeyId = escherKeyId => {
  const integration = findIntegrationByEscherKey(escherKeyId);
  if (!integration.serviceUrl) {
    throw new Error(`No serviceUrl found for integration with ${escherKeyId} keyId.`)
  }
  return integration.serviceUrl;
};

const getAbsolutUrlAndIntegration = config => {
  if (config.escherCredentialScope && config.escherSecret) {
    return {
      absoluteUrl: config.url,
      integration: {
        keyId: config.escherKeyId,
        secret: config.escherSecret,
        credentialScope: config.escherCredentialScope
      }
    };
  } else if (config.url.startsWith('http')) {
    const url = new URL(config.url);
    const integration = findIntegrationByUrl(url.origin);
    return { absoluteUrl: url.href, integration };
  } else {
    const integration = findIntegrationByEscherKey(config.escherKeyId);
    if (!integration.serviceUrl) {
      throw new Error(`No serviceUrl found for integration with ${config.escherKeyId} keyId.`)
    }
    return { absoluteUrl: integration.serviceUrl + config.url, integration };
  }
};

const addAuthHeaders = ({ integration, method, relativeUrl, data, headers }) => {
  const escher = getEscherForIntegration(integration);

  const headersToSign = Object.keys(headers);
  const signedRequest = escher.signRequest(
    {
      method: method.toUpperCase(),
      url: relativeUrl,
      headers: _.toPairs(headers)
    },
    data || '',
    headersToSign
  );
  return _.fromPairs(signedRequest.headers);
};

const getEscherForIntegration = integration =>
  new Escher({
    accessKeyId: integration.keyId,
    apiSecret: integration.secret,
    credentialScope: integration.credentialScope,
    ...emsEscherConstants
  });

const findIntegrationByUrl = urlOrigin => {
  const integration = getIntegrations().find(
    integration => integration.serviceUrl === urlOrigin
  );
  if (!integration) {
    throw new Error(`Escher integration not found for ${urlOrigin} serviceUrl.`);
  }
  return integration;
};

const findIntegrationByEscherKey = escherKeyId => {
  const integration = getIntegrations()
    .filter(integration => !integration.acceptOnly)
    .find(integration => integration.keyId.replace(/_v\d+/, '') === escherKeyId);
  if (!integration) {
    throw new Error(`Escher integration not found for ${escherKeyId} escherKeyId.`);
  }
  return integration;
};

const keyDbForAuthenticate = escherKeyId => {
  const integration = getIntegrations().find(integration => integration.keyId === escherKeyId);
  if (!integration) {
    throw new Error(`Escher integration not found for ${escherKeyId} escherKeyId.`);
  }
  return integration.secret;
};

const getIntegrations = () => {
  try {
    return JSON.parse(process.env.ESCHER_INTEGRATIONS || process.env.ESCHER_KEY_POOL || process.env.SUITE_ESCHER_KEY_POOL);
  } catch (error) {
    throw new Error('No escher configuration env variable found or configuration is not a valid JSON');
  }
};
