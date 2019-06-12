'use strict';

const Escher = require('escher-auth');
const axios = require('axios');
const { URL } = require('url');

exports.get = async url => {
  if (isAbsoluteUrl(url)) {
    const parsedUrl = new URL(url);
    const integration = findIntegrationByServiceUrl(parsedUrl.origin);

  } else {
    console.log('todo: look up url by keyId');
  }
};

const isAbsoluteUrl = url => url.startsWith('http');

const findIntegrationByServiceUrl = url =>
  JSON.parse(process.env.ESCHER_INTEGRATIONS).find(
    integration => integration.serviceUrl === url
  );
