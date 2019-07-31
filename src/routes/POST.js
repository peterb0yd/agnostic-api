/* POST */
const verifiers = require("../lib/verifiers");
const generators = require("../lib/generators");
const broadcast = require("../lib/broadcast");
const {
  getInstanceFromBody,
  getUUID,
  getModelIndexes,
  validFieldType,
  assertUnique,
  errorHandler
} = require("../lib/utils");
const db = require("../lib/utils/db");

module.exports = {
  /**
   * Handle all POST requests
   */
  postHandler: async function(req, res, next) {
    let missingFields = []; // will populate with any missing fields
    req.beforeSaveCallbacks = []; // hook, run these functions before saving anything to DB (all generators and verifiers are resolved at runtime)

    req.hooks = {
      // functions that can be added anywhere during req processing (like in a generator for examples) that need to be run later
      beforeSave: [], // after verification and generators are resolved and before req model is saved to DB
      afterSave: [] // after req model is saved to db
    };

    // Get model data from request body
    req.bodyInstance = getInstanceFromBody(req);
    req.bodyInstance.id = getUUID();

    try {
      // Validate each field based on the model spec
      for (let [fieldName, fieldOptions] of Object.entries(
        req.instanceModel.fields
      )) {
        let fieldValue = req.bodyInstance[fieldName];

        // Required
        if (fieldOptions.required && !fieldValue) {
          missingFields.push(fieldName);
          continue;
        }
        // Not required, Empty value, Has default
        if (!fieldValue && typeof fieldOptions.default !== "undefined") {
          req.bodyInstance[fieldName] = fieldOptions.default;
          continue;
        }
        // Not required, Empty value, Not generated, No default
        if (!fieldValue && !fieldOptions.generate) {
          continue;
        }
        // Validate Type
        if (fieldValue && !validFieldType(fieldValue, fieldOptions)) {
          throw {
            error: new Error(),
            fieldName,
            typeError: true
          };
        }
        // Unique
        if (fieldOptions.unique)
          await assertUnique(req.db, req.modelName, fieldName, fieldValue);
      }

      // Missing fields
      if (missingFields.length) {
        throw {
          error: new Error(),
          missingFieldsError: true,
          missingFields
        };
      }

      // Verify & Generate each field in model
      for (let [fieldName, fieldOptions] of Object.entries(
        req.instanceModel.fields
      )) {
        let fieldValue = req.bodyInstance[fieldName];

        // Verification
        if (
          !!fieldValue &&
          fieldOptions.verify &&
          fieldOptions.verify.includes(req.method)
        ) {
          await verifiers[fieldName](req, fieldOptions);
        }

        // Generation
        if (
          fieldOptions.generate &&
          fieldOptions.generate.includes(req.method)
        ) {
          await generators[fieldName]({ req, res, fieldName, fieldOptions });
        }
      }

      // Run functions in the array at req.beforeSaveCallbacks, assume all are async
      for (const func of req.hooks.beforeSave) {
        await func();
      }

      // Store in DB
      if (req.instanceModel.persistent) {
        const indexes = getModelIndexes(req.instanceModel);
        await db.saveInstance(
          req.db,
          req.modelName,
          req.bodyInstance,
          indexes,
          req.instanceModel.expiration
        );
      }

      // Run functions in the array at req.beforeSaveCallbacks, assume all are async
      for (const func of req.hooks.afterSave) {
        await func();
      }

      // Broadcast if needed
      if (req.instanceModel.broadcast) {
        broadcast.send(req.bodyInstance, req.instanceModel, req.method);
      }
    } catch (error) {
      errorHandler(req, res, error);
      return;
    }

    res.json(req.bodyInstance);
    return;
  }
};
