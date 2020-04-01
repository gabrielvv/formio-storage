const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');
const { promisify } = require('util');
const debug = require('debug')('koa:storage:azure');

const containerName = process.env.AZURE_STORAGE_CONTAINER;
const account = process.env.AZURE_STORAGE_ACCOUNT;
const accountKey = process.env.AZURE_STORAGE_ACCESS_KEY;

const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  sharedKeyCredential,
);

const createContainerIfNotExists = async () => {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const createContainerResponse = await containerClient.create();
  return createContainerResponse;
};

const createPresignedPost = async (ctx) => {
  debug('createPresignedPost');
  await createContainerIfNotExists(containerName);
  // Generate user delegation SAS for a container
  const userDelegationKey = await blobServiceClient.getUserDelegationKey(startsOn, expiresOn);
  const containerSAS = generateBlobSASQueryParameters({
    containerName, // Required
    permissions: ContainerSASPermissions.parse('racwdl'), // Required
    startsOn, // Required. Date type
    expiresOn, // Optional. Date type
    ipRange: { start: '0.0.0.0', end: '255.255.255.255' }, // Optional
    protocol: SASProtocol.HttpsAndHttp, // Optional
    version: '2018-11-09', // Must >= 2018-11-09 to generate user delegation SAS
  },
  userDelegationKey, // UserDelegationKey
  accountName).toString();
};

const createPresignedGet = async (ctx) => {
  debug('createPresignedGet');
  await createContainerIfNotExists(containerName);
};

module.exports = {
  createPresignedPost,
  createPresignedGet,
};
