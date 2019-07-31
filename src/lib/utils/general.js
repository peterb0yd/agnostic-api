const crypto = require("crypto");
const _ = require("lodash");
// * Public Functions

/**
 * getUUID - returns a unique ID
 */
exports.getUUID = function() {
  return crypto.randomBytes(16).toString("hex");
};

/**
 * isEmpty - checks if object or array is empty
 * @param {object, array} data - the data to check if empty or not
 */
exports.isEmpty = function(data) {
  if (!data || typeof data === "undefined") {
    return true;
  } else if (typeof data === "object") {
    return Object.keys(data).length === 0;
  } else {
    return data.length === 0;
  }
};

/**
 * pick - returns an sub-object with only fields specified
 * @param {array} fields - string array of field names
 * @param {object} obj - the object to pull the data from
 */
exports.pick = function(fields, obj) {
  const tmp = {};
  Object.entries(obj).forEach(([key, val]) => {
    if (fields.includes(key)) tmp[key] = val;
  });
  return tmp;
};

/**
 * unflatten - turn a flat object into a deeply nested object
 * @param {object} data - the flat object
 */
exports.unflatten = function(data) {
  const result = {};
  for (let i in data) {
    const keys = i.split(".");
    keys.reduce((r, e, j) => {
      return (
        r[e] ||
        (r[e] = isNaN(Number(keys[j + 1]))
          ? keys.length - 1 == j
            ? data[i]
            : {}
          : [])
      );
    }, result);
  }
  return result;
};

/**
 * getFutureTimestamp - returns a timestamp that represents the time at a specified time period
 *                      given the current time
 * @param {object} timeData - an object representing the time period
 * @param {number} timeData.DAYS - the number of days in the time period
 * @param {number} timeData.HOURS - the number of hours in the time period
 * @param {number} timeData.MINUTES - the number of minutes in the time period
 * @param {number} timeData.SECONDS - the number of seconds in the time period
 */
exports.getFutureTimestamp = function({ DAYS, HOURS, MINUTES, SECONDS }) {
  const newTime = (currentTime = new Date());
  if (DAYS) newTime.setDate(currentTime.getDate() + DAYS);
  if (HOURS) newTime.setHours(currentTime.getHours() + HOURS);
  if (MINUTES) newTime.setMinutes(currentTime.getMinutes() + MINUTES);
  if (SECONDS) newTime.setSeconds(currentTime.getSeconds() + SECONDS);
  return newTime.valueOf();
};

/**
 * renderPublicModel - remove all not public fields from a model for display purposes
 *
 * @param {object} instance - an instance of a model
 * @param {object} schema - schema definition of model
 */
exports.renderPublicModel = (instance, schema) => {
  const publicFields = _.pickBy(schema.fields, { public: true });
  return _.pick(instance, Object.keys(publicFields));
};
