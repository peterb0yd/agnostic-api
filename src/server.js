const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const _ = require("lodash");
const app = express();

const {
  getAppName,
  getModelName,
  getInstanceModel,
  getInstance,
  errorHandler
} = require("./lib/utils");
const redisClients = require("./lib/redis");
const jwt = require("./lib/jwt");

const corsOptions = {
  exposedHeaders: "Auth"
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

/**
 * Route files
 */
const { getHandler } = require("./routes/GET");
const { postHandler } = require("./routes/POST");
const { patchHandler } = require("./routes/PATCH");
// const {putHandler} = require('./routes/PUT');
// const {deleteHandler} = require('./routes/DELETE.js');

/**
 * All Route Middleware
 */
app.use(async (req, res, next) => {
  try {
    req.appName = getAppName(req.hostname);
    console.log({ appName: req.appName });
    req.modelName = getModelName(req.path);
    console.log({ path: req.path });

    // Set Model
    req.instanceModel = getInstanceModel(req);

    // Set DB
    req.db = redisClients[req.appName];

    // Authenticate route if needed for this model
    if (req.instanceModel.authRoutes.includes(req.method)) {
      // Get auth token
      const { auth } = req.headers;
      console.log({ headers: req.headers });
      if (!auth) {
        throw {
          error: new Error(),
          needsAuth: true
        };
      }

      // Is Administrator?
      if (auth === process.env.ADMIN_AUTH) {
        // continue as admin
      }

      // Is requester authenticated?
      else {
        // Get instance from key
        const tokenData = jwt.verify(req.appName, auth);
        const key = tokenData.data;
        const dbInstance = await getInstance({ db: req.db, key });
        if (_.isEmpty(dbInstance)) {
          throw {
            error: new Error(),
            expired: true
          };
        }
      }
    }

    // Continue
    next();
  } catch (error) {
    errorHandler(req, res, error);
  }
});

/**
 * All Route Handlers
 */
app.get("/[a-z]+/:id", getHandler);
app.get("*", getHandler);
app.post("*", postHandler);
app.patch("*/:id", patchHandler);

/**
 * Start API
 */
app.listen(process.env.PORT, function() {
  console.log(`Agnostic-API listening on port ${process.env.PORT}`);
});
