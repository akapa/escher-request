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
  config = { timeout: 15000, ...config };

  const { absouleUrl, integration } = getAbsolutUrlAndIntegration(
    config.url,
    config.escherKeyId
  );
  const urlWithParams = axios.getUri({
    url: absouleUrl,
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

exports.preSignUrl = (urlParam, { expires = 86400, escherKeyId = null }) => {
  const { absouleUrl, integration } = getAbsolutUrlAndIntegration(urlParam, escherKeyId);
  const escher = getEscherForIntegration(integration);
  return escher.preSignUrl(absouleUrl, expires);
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

const getAbsolutUrlAndIntegration = (urlParam, escherKeyId) => {
  if (urlParam.startsWith('http')) {
    const url = new URL(urlParam);
    const integration = findIntegrationByUrl(url.origin);
    return { absouleUrl: url.href, integration };
  } else {
    const integration = findIntegrationByEscherKey(escherKeyId);
    return { absouleUrl: integration.serviceUrl + urlParam, integration };
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
  return getIntegrations().find(integration => integration.keyId === escherKeyId).secret;
};

const getIntegrations = () => {
  try {
    return JSON.parse(process.env.ESCHER_INTEGRATIONS);
  } catch (error) {
    throw new Error('content of the ESCHER_INTEGRATIONS env variable is not valid JSON.');
  }
};
