
const config = require('../index');
const { 
    ROUTES: {
        POST, GET, PATCH, PUT, DELETE 
    }, 
    RELATIONSHIPS: {
        HAS_MANY, OF_MANY, HAS_ONE, BELONGS_TO
    }, 
    EXPIRATION_VALUES: {
        DAYS, HOURS, MINUTES, SECONDS
    }, 
    FIELD_TYPES: {
        STRING, BOOLEAN, NUMBER, MODEL
    }
} = config;

module.exports = {
    shops: {
        persistent: true,
        authRoutes: [
            POST,
            PATCH,
            PUT,
            DELETE
        ],
        fields: {
            name: {
                type: STRING,
                required: true
            },
            openHour: {
                type: NUMBER,
                required: true
            },
            closeHour: {
                type: NUMBER,
                required: true
            },
            isOpen: {
                type: BOOLEAN,
                default: true
            },
            closedMessage: {
                type: STRING
            }
        }
    },
    users: {
        persistent: true,
        expiration: { 
            [DAYS]: 1 
        },
        authRoutes: [
            GET, 
            PATCH, 
            PUT, 
            DELETE
        ],
        fields: {
            inviteCodeUsed: {
                type: STRING,
                index: true,
                verify: [ POST ]
            },
            authLevel: {
                type: NUMBER,
                generate: [ POST ],
                default: 0
            },
            role: {
                type: STRING,
            },
            firstName: {
                type: STRING,
                required: true,
                public: true
            },
            lastName: {
                type: STRING,
                required: true,
                public: true
            },
            phoneNumber: {
                type: STRING,
                required: true,
                index: true,
                public: true,
                unique: true
            },
            phoneNumberVerified: {
                type: BOOLEAN,
                public: true,
                verify: [ PATCH ],
                default: false
            },
            email: {
                type: STRING,
                required: true,
                index: true,
                unique: true,
                verify: [ POST ],
                verifyMsg: "Howdy from Dreamy! Click the link below to verify your email.<br><br><a href=\http://dev-dreamydc.com/verify/$CODE\>Verify Email</a>"
            },
            emailVerified: {
                type: BOOLEAN,
                public: true,
                default: false
            },
            inviteCode: {
                type: STRING,
                generate: [ POST ],
                index: true
            },
            invites: {
                type: NUMBER,
                default: 0
            },
            discounts: {
                type: NUMBER,
                default: 0
            }
        }
    },
    sessions: {
        createAuth: PATCH,
        persistent: true,
        authRoutes: [ GET, DELETE ],
        expiration: { 
            [MINUTES]: 30 
        },
        fields: {
            userId: {
                type: MODEL,
                generate: [ POST ],
                relatedBy: 'phoneNumber',
                relationship: OF_MANY
            },
            phoneCode: {
                type: STRING,
                generate: [ POST ],
                verify: [ PATCH ]
            },
            phoneCodeVerified: {
                type: BOOLEAN,
                default: false
            },
            phoneNumber: {
                type: STRING,
                required: true,
                index: true,
                verify: [ POST ],
                verifyMsg: "Hello from Dreamy! Your verification code is $CODE."
            }
        }
    },
    products: {
        persistent: true,
        authRoutes: [ POST, PATCH, DELETE ],
        fields: {
            name: {
                type: STRING,
                required: true,
            },
            price: {
                type: NUMBER,
                required: true
            }
        }
    },
    orders: {
        persistent: true,
        authRoutes: [],
        broadcast: [ POST, PATCH, DELETE ],
        fields: {
            status: {
                type: STRING,
                default: 'NEW',
                public: true
            },
            item: {
                type: STRING,
                public: true
            }
        }
    }
}
