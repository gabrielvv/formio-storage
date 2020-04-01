const {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
} = require('@azure/storage-blob');
const debug = require('debug')('koa:storage:azure');

const containerName = process.env.AZURE_STORAGE_CONTAINER;
const account = process.env.AZURE_STORAGE_ACCOUNT;
const accountKey = process.env.AZURE_STORAGE_ACCESS_KEY;

const accountUrl = `https://${account}.blob.core.windows.net`;
const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(
  accountUrl,
  sharedKeyCredential,
);

const getPresignedUrl = (blobName, permissions) => {
  const blobSAS = generateBlobSASQueryParameters({
    containerName,
    blobName,
    permissions: BlobSASPermissions.parse(permissions),
    startsOn: new Date(),
    expiresOn: new Date(new Date().valueOf() + 86400),
    cacheControl: 'cache-control-override',
    contentDisposition: 'content-disposition-override',
    contentEncoding: 'content-encoding-override',
    contentLanguage: 'content-language-override',
    contentType: 'content-type-override',
    ipRange: { start: '0.0.0.0', end: '255.255.255.255' },
    protocol: SASProtocol.HttpsAndHttp,
    version: '2016-05-31',
  },
  sharedKeyCredential).toString();
  debug(blobSAS);

  return `${accountUrl}/${containerName}/${blobName}?${blobSAS}`;
};

const createContainerIfNotExists = async () => {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  try {
    await containerClient.create();
  } catch (err) {
    debug(err.message);
  }
};

const createPresignedPost = async (ctx) => {
  debug('createPresignedPost');
  await createContainerIfNotExists(containerName);
  const blobName = ctx.request.body.name;

  ctx.body = {
    url: getPresignedUrl(blobName, 'c'),
  };
};

const createPresignedGet = async (ctx) => {
  debug('createPresignedGet');
  await createContainerIfNotExists(containerName);
  const blobName = ctx.query.name;

  ctx.body = {
    url: getPresignedUrl(blobName, 'r'),
  };
};

module.exports = {
  createPresignedPost,
  createPresignedGet,
};
