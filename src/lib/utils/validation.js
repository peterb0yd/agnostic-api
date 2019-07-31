
Array.prototype.isArray = true;
String.prototype.isArray = false;
Number.prototype.isArray = false;
Object.prototype.isArray = false;

const FIELD_TYPES = {
    STRING: 'string',
    MODEL: 'model',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
    ARRAY: 'array',
    OBJECT: 'object',
    GEO: 'geo'
}

/**
 * validFieldType - ensure the field value type matches the field options in the model spec
 * 
 * @param {*} fieldValue - the value given with the instance
 * @param {*} fieldOptions - the options specified in the model spec
 * @param {*} fieldOptions.type - the type specified in the options 
 */
exports.validFieldType = function (fieldValue, { type }) {
    switch (type) {
        case FIELD_TYPES.STRING: return typeof fieldValue === FIELD_TYPES.STRING; 
        case FIELD_TYPES.MODEL: return true;   // TODO make a better validation for `model`
        case FIELD_TYPES.NUMBER: return isNaN(fieldValue) === false;
        case FIELD_TYPES.BOOLEAN: typeof fieldValue === FIELD_TYPES.BOOLEAN;
        case FIELD_TYPES.ARRAY: return fieldValue.isArray;
        case FIELD_TYPES.OBJECT: return typeof fieldValue === FIELD_TYPES.OBJECT;
        case FIELD_TYPES.GEO: return true;  // TODO make a better validation for 'geo'
    }
}