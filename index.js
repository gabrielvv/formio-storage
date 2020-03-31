/* eslint-disable global-require */
require('dotenv').config();
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const Koa = require('koa');

const providers = {
  s3: require('./s3'),
  azure: require('./azure'),
};


const app = new Koa();
const router = new Router();

app.use(bodyParser());
app.use(cors({
  origin: '*',
}));

router.post('/form/:formId/storage/:provider', async (ctx, next) => providers[ctx.params.provider].createPresignedPost(ctx, next));
router.get('/form/:formId/storage/:provider', async (ctx, next) => providers[ctx.params.provider].createPresignedGet(ctx, next));

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);
