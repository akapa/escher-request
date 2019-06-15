'use strict';

const Escher = require('escher-auth');
const axios = require('axios');
const { URL } = require('url');
const _ = require('lodash');

exports.get = async (url, config = {}) => {
  if (isAbsoluteUrl(url)) {
    const urlObject = new URL(url);
    const integration = findIntegrationByServiceUrl(urlObject.origin);
    const escher = new Escher({
      accessKeyId: integration.keyId,
      apiSecret: integration.secret,
      credentialScope: integration.credentialScope,
      algoPrefix: 'EMS',
      vendorKey: 'EMS',
      authHeaderName: 'X-Ems-Auth',
      dateHeaderName: 'X-Ems-Date'
    });

    const headers = {
      ...config.headers,
      'content-type': 'application/json',
      host: urlObject.host
    };
    const body = '';
    const method = 'GET';
    const relativeUrl = urlObject.pathname + urlObject.search;

    const headersWithAuth = calculateAuthHeaders({
      escher,
      method,
      relativeUrl,
      body,
      headers
    });

    const response = await axios.get(url, { headers: headersWithAuth });
    return _.omit(response, 'request');
  } else {
    console.log('todo: look up url by keyId');
  }
};

const isAbsoluteUrl = url => url.startsWith('http');

const findIntegrationByServiceUrl = url => {
  const integrations = JSON.parse(process.env.ESCHER_INTEGRATIONS);
  const integration = integrations.find(integration => integration.serviceUrl === url);
  if (!integration) {
    throw new Error(`Integration for ${url} is not found in integrations`);
  }
  return integration;
}

const calculateAuthHeaders = ({ escher, method, relativeUrl, body, headers }) => {
  const headersToSign = Object.keys(headers);
  const signedRequest = escher.signRequest(
    { method, url: relativeUrl, headers: _.toPairs(headers) },
    body,
    headersToSign
  );
  return _.fromPairs(signedRequest.headers);
};
