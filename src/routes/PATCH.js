/* PATCH */

const verifiers = require('../lib/verifiers');
const jwt = require('../lib/jwt');
const broadcast = require("../lib/broadcast");
const {getPathParts, getInstance, getInstanceFromBody, updateInstance, errorHandler} = require('../lib/utils');

module.exports = {
    /**
     * Handle all PATCH requests
     */
    patchHandler: async function (req, res) {
        try {

             // Get model data from request body
            req.bodyInstance = getInstanceFromBody(req);

            // Get Path
            const pathParts = getPathParts(req.path);
            // Get Instance ID
            req.bodyInstance.id = pathParts[1];

            // Get Instance from database
            const id = req.bodyInstance.id;
            const { db, modelName } = req;
            req.dbInstance = await getInstance({ db, modelName, id });
            // Check if instance exists
            if (!req.dbInstance) {
                throw {
                    error: new Error(),
                    instanceNotFound: true
                }
            }

            // Verify each field passed
            for (let [fieldName, fieldOptions] of Object.entries(req.instanceModel.fields)) {
                // Verify if this field needs verification for the PATCH field and the value isn't undefined
                if (fieldOptions.verify && fieldOptions.verify.includes(req.method) && req.bodyInstance[fieldName] !== 'undefined') {
                    await verifiers[fieldName](req, fieldOptions);
                }
            }

            // Save Instance to database
            const key = await updateInstance(req);

            // Create Auth if needed 
            if (req.instanceModel.createAuth === req.method) {
                const authToken = jwt.sign(req.appName, key, '7d');
                res.set('Auth', authToken);
            }

            // Broadcast if needed
            if (req.instanceModel.broadcast) {
                broadcast.send(req.bodyInstance, req.instanceModel, req.method);
            }

            res.json({
                id: req.bodyInstance.id
            });
        } 
        catch (error) {
            console.log({error});
            errorHandler(req, res, error);
            return;
        }
    }

}