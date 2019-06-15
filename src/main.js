'use strict';

const Escher = require('escher-auth');
const axios = require('axios');
const { URL } = require('url');
const _ = require('lodash');

exports.request = async config => {};

exports.get = async (url, config = {}) => {
  let integration;
  let urlObject;
  if (isAbsoluteUrl(url)) {
    urlObject = new URL(url);
    integration = findIntegration('serviceUrl', urlObject.origin);
  } else {
    integration = findIntegration('keyId', config.escherKeyId);
    urlObject = new URL(integration.serviceUrl + url);
  }

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

  const response = await axios.get(urlObject.href, { ...config, headers: headersWithAuth });
  return _.omit(response, 'request');
};

const isAbsoluteUrl = url => url.startsWith('http');

const findIntegration = (property, value) => {
  const integrations = JSON.parse(process.env.ESCHER_INTEGRATIONS);
  return integrations.find(integration => integration[property] === value)
};

const calculateAuthHeaders = ({ escher, method, relativeUrl, body, headers }) => {
  const headersToSign = Object.keys(headers);
  const signedRequest = escher.signRequest(
    { method, url: relativeUrl, headers: _.toPairs(headers) },
    body,
    headersToSign
  );
  return _.fromPairs(signedRequest.headers);
};
