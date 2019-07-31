
const config = require('../index');
const { 
    ROUTES: {
        POST 
    }, 
    FIELD_TYPES: {
        STRING, BOOLEAN
    } 
} = config;

module.exports = {
    contacts: {
        persistent: false,
        fields: {
            name: {
                type: STRING,
                required: true
            },
            company: {
                type: STRING,
                required: true
            },
            email: {
                type: STRING,
                required: true
            },
            message: {
                type: STRING,
                required: true
            },
            messageSubmitted: {
                type: BOOLEAN,
                generate: [POST]
            }
        }
    }
};