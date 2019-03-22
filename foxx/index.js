'use strict';

module.context.trustProxy = true;

const createRouter = require('@arangodb/foxx/router');
const router = createRouter();

module.context.use(router);

router.all('/', function(req, res) {
  const filePath = module.context.fileName("files/index.html");
  res.sendFile(filePath);
})
.summary('Vue glue')
.description('Catchall to hand down any unrecognized request to the vue router on the clientside.');