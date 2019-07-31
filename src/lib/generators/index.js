/* Generators */

const { isEmpty, getRandomNumCode, setAdd, orderedSetAdd } = require('../utils');
const config = require('../../config');
const schemas = config.SCHEMAS;
const jwt = require('../jwt');
const sesClients = require('../ses');

// Possible Roles
// TODO: put this somewhere better...
const ROLES = {
    CUSTOMER: 'customer',
    WORKER: 'worker',
    ADMIN: 'admin'
};

// experimenting with this
function relationshipGenerator(generatorFunc) {
    return async function({req, res, fieldName, fieldOptions}) {
        //* this is definitely weird, need other relationships to see if this pattern could actually work
        const relatedId = await generatorFunc({req, res, fieldName, fieldOptions});
        queueCreateRelationship({req, res, fieldName, fieldOptions}, relatedId);
    }
}

/**
 * queueCreateRelationship - if the instance is valid, then create a relationship in the database between two instances
 * @param {object} obj.req - the request object 
 * @param {object} obj.res - the response object 
 * @param {string} obj.fieldName - the field name used to store the data 
 * @param {object} obj.fieldOptions - the field options object
 * @param {string} relatedId - the related instance's id 
 */
function queueCreateRelationship({req, res, fieldName, fieldOptions}, relatedId) {
    if (fieldOptions.generate && fieldOptions.relationship) {
        if (!isEmpty(req.instanceModel.expiration)) {
            req.hooks.afterSave.push(async function() {
                console.log("added an orderedSetAdd function to the afterSave hook");
                await orderedSetAdd(req.db, req.modelName, fieldName, req.instanceModel.expiration, req.bodyInstance.id, relatedId);
            });
        } 
        else {
            req.hooks.afterSave.push(async function() {
                console.log("added a setAdd function to the afterSave hook");
                await setAdd(req.db, req.modelName, fieldName, req.bodyInstance.id, relatedId);
            });
        }
    } 
}

/** 
 * inviteCode - Generate an invite code for a User
 * @param {object} obj.req - the request object 
 */
exports.inviteCode = function ({req}) {
    const { bodyInstance } = req;
    const inviteCode = bodyInstance.firstName[0] + bodyInstance.lastName.slice(0, 4) + getRandomNumCode(4);
    req.bodyInstance.inviteCode = inviteCode.toUpperCase();
}

/**
 * authLevel - Generate the authentication level allowed for this User
 * @param {object} obj.req - the request object 
 */
exports.authLevel = function ({req}) {
    const { role } = req.bodyInstance;
    const authLevel = (() => {
        switch (role) {
            case ROLES.ADMIN: return 2;
            case ROLES.WORKER: return 1;
            case ROLES.CUSTOMER: return 0;
            default: return 0;
        }
    })();
    // TODO If auth level is worker or admin, ensure route auth is correct
    req.bodyInstance.authLevel = authLevel;
}

/**
 * phoneCode - create the phone code for verification
 * @param {object} obj.req - the request object 
 */
exports.phoneCode = function ({req}) {
    req.bodyInstance.phoneCode = getRandomNumCode(4);
    req.bodyInstance.phoneCodeVerified = false;
}

/**
 * userId - generate a relationship with a User instance based on the `relatedBy` field
 * @param {object} obj.req - the request object 
 * @param {object} obj.fieldOptions - the options specified for this field
 */
exports.userId = relationshipGenerator(async ({req, fieldOptions}) => {
    try {
        const relatedFieldName = fieldOptions.relatedBy;
        const fieldValue = req.bodyInstance[relatedFieldName];
        if (!fieldValue) {
            throw {
                error: new Error(),
                missingRelationFieldValue: true
            }
        }
        let indexedUserData = await req.db.hget(`users:${relatedFieldName}`, fieldValue);
        indexedUserData = JSON.parse(indexedUserData);
        if (!indexedUserData) {
            throw {
                error: new Error(),
                userNotFound: true
            }
        }
        let userInstance = await req.db.get(indexedUserData.key);
        userInstance = JSON.parse(userInstance);
        req.bodyInstance.userId = userInstance.id;
        return userInstance.id;
    } 
    catch (error) {
        throw error;
    }
});

/**
 * messageSubmitted - send message, if sent - set to true; else - set to false
 */
exports.messageSubmitted = async function ({req}) {
    try {
        const contact = req.bodyInstance;
        const ses = sesClients[req.appName];
        await ses.emailContactMailer({  
            to: ses.email,
            contact
        });
    } 
    catch (error) {
        throw error;
    }
}