require('dotenv').config();
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const Koa = require('koa');
const s3 = require('./s3');

const app = new Koa();
const router = new Router();

app.use(bodyParser())
app.use(cors({
  origin: '*'
}))

router.post('/form/:formId/storage/s3', s3.createPresignedPost);
router.get('/form/:formId/storage/s3', s3.createPresignedGet);

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);