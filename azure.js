const azure = require('azure-storage');
const { promisify } = require('util');
const debug = require('debug')('koa:storage:azure');

const blobService = azure.createBlobService();
const containerName = process.env.AZURE_STORAGE_CONTAINER;

const createContainerIfNotExistsPromise = promisify(
  blobService.createContainerIfNotExists,
).bind(blobService);

const createPresignedPost = async (ctx) => {
  debug('createPresignedPost');
  await createContainerIfNotExistsPromise(containerName);
};

const createPresignedGet = async (ctx) => {
  debug('createPresignedGet');
  await createContainerIfNotExistsPromise(containerName);
  const startDate = new Date();
  const expiryDate = new Date(startDate);
  expiryDate.setMinutes(startDate.getMinutes() + 100);
  startDate.setMinutes(startDate.getMinutes() - 100);

  const sharedAccessPolicy = {
    AccessPolicy: {
      Permissions: azure.BlobUtilities.SharedAccessPermissions.READ,
      Start: startDate,
      Expiry: expiryDate,
    },
  };

  const blobName = ctx.query.name;
  const token = blobService.generateSharedAccessSignature(
    containerName,
    blobName,
    sharedAccessPolicy,
  );
  ctx.body = {
    url: blobService.getUrl(containerName, blobName, token),
  };
};

module.exports = {
  createPresignedPost,
  createPresignedGet,
};
