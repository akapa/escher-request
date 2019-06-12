'use strict';

const Escher = require('escher-auth');
const axios = require('axios');
const { URL } = require('url');
const _ = require('lodash');

exports.get = async url => {
  if (isAbsoluteUrl(url)) {
    const parsedUrl = new URL(url);
    const integration = findIntegrationByServiceUrl(parsedUrl.origin);
    const escher = new Escher({
      accessKeyId: integration.keyId,
      apiSecret: integration.secret,
      credentialScope: integration.credentialScope,
      algoPrefix: 'EMS',
      vendorKey: 'EMS',
      authHeaderName: 'X-Ems-Auth',
      dateHeaderName: 'X-Ems-Date'
    });

    const requestOptionsForSign = {
      method: 'GET',
      url: parsedUrl.pathname + parsedUrl.search,
      headers: [['content-type', 'application/json'], ['host', parsedUrl.host]]
    }
    const body = '';
    const headersToSign = requestOptionsForSign.headers.map(header => header[0]);
    const signedOptions = escher.signRequest(requestOptionsForSign, body, headersToSign);

    const response = await axios.get(url, { headers: _.fromPairs(signedOptions.headers) });
    return _.omit(response, 'request')
  } else {
    console.log('todo: look up url by keyId');
  }
};

const isAbsoluteUrl = url => url.startsWith('http');

const findIntegrationByServiceUrl = url =>
  JSON.parse(process.env.ESCHER_INTEGRATIONS).find(
    integration => integration.serviceUrl === url
  );
