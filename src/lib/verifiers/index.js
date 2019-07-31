/* Verifiers */

const twilioClients = require('../twilio');
const sesClients = require('../ses');
const jwt = require('../jwt');
const { getInstance, getInstanceFromIndex, saveInstances } = require('../utils');

/**
 * phoneNumber - Verify the phone number by texting a code to the number
 * @param {object} req - the request object 
 * @param {object} fieldOptions - the options specified for this field
 * @param {object} fieldOptions.verifyMsg - the text message body
 */
exports.phoneNumber = async function (req, {verifyMsg}) {
    try {
        const {phoneNumber} = req.bodyInstance;
        const twilio = twilioClients[req.appName];
        const code = req.bodyInstance.phoneCode;  // * must have the `phoneCode` generator inside the Session generator
        // await twilio.sendText({phoneNumber, verifyMsg, code}); // ! TEMP
    } 
    catch (error) {
        throw error;
    }
}

/**
 * phoneNumberVerified - Verify the user has a verified session and remove expirations
 */
exports.phoneNumberVerified = async function (req) {
    try {
        const {id} = req.bodyInstance;
        // TODO finish this
        // find the user
        // find the session where phoneCodeVerified
        // if found, set to true
        // else set false 
    } 
    catch (error) {
        throw error;
    }
}

/**
 * email - Verify an email address by sending a verification link over email
 * @param {object} req - the request object 
 * @param {object} fieldOptions - the options specified for this field
 * @param {object} fieldOptions.verifyMsg - the email body
 */
exports.email = async function (req, {verifyMsg}) {
    try {
        const {email} = req.bodyInstance;
        const ses = sesClients[req.appName];
        const token = jwt.sign(req.appName, {email});
        await ses.emailVerificationMailer({  
            from: ses.email, 
            to: email, 
            subject: 'Verify Your Email!',
            token, 
            verifyMsg
        });
    } 
    catch (error) {
        throw {
            error,
            invalidEmail: true
        };
    }
}

/**
 * inviteCodeUsed - Verify the invite code belongs to another User in the database
 * @param {object} req - the request object 
 * @param {object} fieldOptions - the options specified for this field
 */
exports.inviteCodeUsed = async function (req) {
    try {
        const { db, bodyInstance, modelName } = req;
        const { inviteCodeUsed } = bodyInstance;
        console.log('searching inviter');
        try {
            const inviterInstance = await getInstanceFromIndex({ 
                db, 
                modelName, 
                indexField: 'inviteCode', 
                indexValue: inviteCodeUsed 
            });
        } 
        catch (error) {
            console.log({inviterError: error});
            throw {
                error,
                inviterNotFound: true
            }
        }
        console.log('got passed');
        if (!inviterInstance.emailVerified && !inviterInstance.phoneVerified) {
            throw {
                error: new Error(), 
                inviterUnverified: true,
            };
        }
        // Increment invites and discounts for both users
        req.hooks.afterSave.push(async () => {
            try {
                inviterInstance.invites += 1;
                bodyInstance.discounts += 1;
                await saveInstances(db, modelName, [inviterInstance, bodyInstance]);
            } 
            catch (error) {
                throw error;
            }
        });
    } 
    catch (error) {
        throw error;
    }
}

/**
 * phoneCode - verify the phoneCode submitted
 * @param {object} req - the request object 
 * @param {object} fieldOptions - the options specified for this field
 */
exports.phoneCode = async function (req, {required}) {
    try {
        const { id, phoneCode } = req.bodyInstance;
        const { db, modelName } = req;
        console.log({phoneCode});
        // Check if already verified
        if (req.dbInstance.phoneCodeVerified) {
            throw {
                error: new Error(),
                phoneCodeAlreadyVerified: true
            }
        }
        // Compare the inputted phoneCode to the one in the database
        if (phoneCode === req.dbInstance.phoneCode) {
            req.bodyInstance.phoneCodeVerified = true;
        } else {
            throw {
                error: new Error(),
                phoneCodeIncorrect: true
            }
        }
    } 
    catch (error) {
        throw error;
    }
}