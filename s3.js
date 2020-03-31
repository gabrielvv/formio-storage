const S3 = require('aws-sdk/clients/s3');

const s3 = new S3();
const _ = require('lodash');
const debug = require('debug')('koa:storage:s3');
const { promisify } = require('util');

const createBucketPromise = promisify(s3.createBucket).bind(s3);
const putBucketCorsPromise = promisify(s3.putBucketCors).bind(s3);

const createPresignedPost = async (ctx) => {
  debug('createPresignedPost');
  const requestBody = ctx.request.body;
  await createBucketPromise({ Bucket: process.env.AWS_BUCKET });
  await putBucketCorsPromise({
    Bucket: process.env.AWS_BUCKET,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: [
            '*',
          ],
          AllowedMethods: [
            'PUT',
            'POST',
            'DELETE',
          ],
          AllowedOrigins: [
            process.env.ORIGIN,
          ],
          ExposeHeaders: [
            'x-amz-server-side-encryption',
          ],
          MaxAgeSeconds: 3000,
        },
        {
          AllowedHeaders: [
            'Authorization',
          ],
          AllowedMethods: [
            'GET',
          ],
          AllowedOrigins: [
            '*',
          ],
          MaxAgeSeconds: 3000,
        },
      ],
    },
    ContentMD5: '',
  });
  ctx.body = await s3.createPresignedPost({
    Bucket: process.env.AWS_BUCKET,
    Fields: {
      key: requestBody.name,
      fileName: requestBody.name,
    },
    conditions: [
      { acl: 'private' },
      { success_action_status: '201' },
      ['starts-with', '$key', ''],
      ['content-length-range', 0, 100000],
      { 'x-amz-algorithm': 'AWS4-HMAC-SHA256' },
    ],
  });
  ctx.body.AWS_BUCKET = process.env.AWS_BUCKET;
  ctx.body.data = {
    ..._.omit(ctx.body.fields, ['key', 'filename']),
  };
};

const createPresignedGet = async (ctx) => {
  debug('createPresignedGet');
  ctx.body = {
    url: await s3.getSignedUrlPromise('getObject', {
      Bucket: ctx.query.AWS_BUCKET,
      Key: ctx.query.key,
    }),
  };
};

module.exports = {
  createPresignedPost,
  createPresignedGet,
};
