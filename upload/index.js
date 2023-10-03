const { BlobServiceClient } = require("@azure/storage-blob");
const multipart = require("parse-multipart");
const { v4: uuidv4 } = require("uuid");
const { dto } = require("../utils/functions");
const { jwtMiddlewareHandler } = require("../middleware/jwtMiddleWare");

module.exports = jwtMiddlewareHandler("fileUpload")
  .use(async (ctx) => {
    const buffer = Buffer.from(ctx.req.body);
    const boundary = multipart.getBoundary(ctx.req.headers["content-type"]);
    const parts = multipart.Parse(buffer, boundary);
    const blobServiceClient = await BlobServiceClient.fromConnectionString(
      process.env.AzureWebJobsStorage
    );
    const containerClient = await blobServiceClient.getContainerClient("files");
    const blockBlobClient = containerClient.getBlockBlobClient(
      uuidv4() + "_" + parts[0].filename
    );
    await blockBlobClient.upload(parts[0].data, parts[0].data.length);
    ctx.res = dto(200, blockBlobClient.url);
    ctx.done();
  })
  .catch((error, ctx) => {
    ctx.log.info(error);
    ctx.next();
  })
  .listen();
