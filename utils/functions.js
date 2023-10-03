const { CosmosClient } = require("@azure/cosmos");
const { QueueServiceClient } = require("@azure/storage-queue");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ADMIN_ALLOWED, SURVEYOR_ALLOWED } = require("./constants");

module.exports = {
  dto: (status, body, message = "Success") => {
    return {
      status: status,
      body: {
        data: body,
        message: message,
      },
    };
  },

  getSignedJwtToken: (user) => {
    delete user.password;
    return {
      accessToken: jwt.sign(user, process.env["jwtSecret"], {
        expiresIn: process.env["jwtExpiresIn"],
      }),
      refreshToken: jwt.sign(user, process.env["jwtSecret"], {
        expiresIn: process.env["refreshExpiresIn"],
      }),
    };
  },

  matchPassword: async (password, newPassword) => {
    return await bcrypt.compare(password, newPassword);
  },

  validateSchema: (data, schema) => {
    if (!data) {
      return { error: { details: [{ message: "Body is required" }] } };
    }
    const validation = schema.validate(data);
    return validation;
  },

  paginateData: (data, pageNumber = 1, pageSize = 10, searchText, field) => {
    const paginated = data.slice(
      (pageNumber - 1) * pageSize,
      pageNumber * pageSize
    );
    return {
      count: data.length,
      data: searchText
        ? paginated.filter((idx) =>
            idx[field].toLowerCase().includes(searchText.toLowerCase())
          )
        : paginated,
    };
  },

  updateHistory: (data, modifiedBy, createdBy) => {
    if (createdBy && modifiedBy) {
      data.createdBy = createdBy;
      data.modifiedBy = modifiedBy;
      data.createdOn = new Date().toISOString();
      data.modifiedOn = new Date().toISOString();
      data.isActive = true;
      return data;
    } else {
      data.modifiedBy = modifiedBy;
      data.modifiedOn = new Date().toISOString();
      data.isActive = true;
      return data;
    }
  },

  sendMessageToQueue: async (queueName, message) => {
    console.log("queueName :", queueName);
    console.log("message :", message);

    const STORAGE_CONNECTION_STRING = process.env["AzureWebJobsStorage"];
    const queueServiceClient = QueueServiceClient.fromConnectionString(
      STORAGE_CONNECTION_STRING
    );
    const queueClient = queueServiceClient.getQueueClient(queueName.toString());
    const base64data = Buffer.from(JSON.stringify(message)).toString("base64");
    queueClient.sendMessage(base64data);
  },

  validateRequest: (req, endpoint) => {
    if (!req.headers?.authorization) {
      return;
    }
    try {
      const header = req.headers.authorization;
      const decoded = jwt.verify(
        header.includes("Bearer") ? header.split(" ")[1] : header,
        process.env["jwtSecret"]
      );
      if (decoded.role === "admin" && ADMIN_ALLOWED.indexOf(endpoint) > -1) {
        return decoded;
      }
      if (
        decoded &&
        decoded.role === "surveyor" &&
        SURVEYOR_ALLOWED.indexOf(endpoint) > -1
      ) {
        return decoded;
      }
      return;
    } catch {
      return;
    }
  },

  replaceStringWithJsonValues: (inputStr, replaceValuesJson) => {
    for (var key in replaceValuesJson) {
      var updatedKey = "{" + key + "}";

      var reg = new RegExp(updatedKey, "g");

      inputStr = inputStr.replace(reg, replaceValuesJson[key]);
    }

    return inputStr;
  },

  getPaginatedData: async (
    collectionName,
    field,
    searchText,
    pageNumber = 1,
    pageSize = 10,
    filter,
    additionalQuery
  ) => {
    let query = `SELECT * FROM c WHERE c.isActive ${
      searchText ? `AND CONTAINS(c.${field}, '${searchText}', true)` : ""
    }`;
    let countQuery = `SELECT VALUE COUNT(1) FROM c WHERE c.isActive ${
      searchText ? `AND CONTAINS(c.${field}, '${searchText}', true)` : ""
    }`;
    const client = new CosmosClient(process.env["CosmosDbConnectionString"]);
    if (filter) {
      for (var key in filter) {
        if (filter[key]) {
          query += ` AND c.${key}='${filter[key]}'`;
          countQuery += ` AND c.${key}='${filter[key]}'`;
        }
      }
    }
    if (additionalQuery) {
      query += additionalQuery;
      countQuery += additionalQuery;
    }
    console.log(query);
    const container = client.database("collectpos").container(collectionName);
    const { resources: data } = await container.items
      .query(
        `${query} OFFSET ${parseInt(
          (pageNumber - 1) * pageSize
        )} LIMIT ${parseInt(pageSize)}`
      )
      .fetchAll();
    // const { resources: count } = await container.items
    //   .query(countQuery)
    //   .fetchAll();
    // return { data, count: count[0] };
    return data;
  },

  parseHtml: (rawHtml, data) => {
    const htmlTemplate = rawHtml.toString("utf8");
    return module.exports.replaceStringWithJsonValues(htmlTemplate, data);
  },

  insertAt: (str, sub, pos) => `${str.slice(0, pos)}${sub}${str.slice(pos)}`,
};
