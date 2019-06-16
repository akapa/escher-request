'use strict';

const Escher = require('escher-auth');
const axios = require('axios');
const { URL } = require('url');
const _ = require('lodash');

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

['delete', 'get', 'head', 'options'].forEach(method => {
  exports[method] = async (url, config = {}) => exports.request({ ...config, method, url });
});
['post', 'put', 'patch'].forEach(method => {
  exports[method] = async (url, data, config = {}) => exports.request({ ...config, method, url, data });
});

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
  const escher = new Escher({
    accessKeyId: integration.keyId,
    apiSecret: integration.secret,
    credentialScope: integration.credentialScope,
    algoPrefix: 'EMS',
    vendorKey: 'EMS',
    authHeaderName: 'X-Ems-Auth',
    dateHeaderName: 'X-Ems-Date'
  });

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
}

const findIntegrationByUrl = urlOrigin => {
  const integrations = JSON.parse(process.env.ESCHER_INTEGRATIONS);
  return integrations.find(integration => integration.serviceUrl === urlOrigin)
};

const findIntegrationByEscherKey = escherKeyId => {
  const integrations = JSON.parse(process.env.ESCHER_INTEGRATIONS);
  return integrations
    .filter(integration => !integration.acceptOnly)
    .find(integration => integration.keyId.replace(/_v\d+/, '') === escherKeyId);
}