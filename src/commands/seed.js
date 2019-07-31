const faker = require('faker');
const AXIOS = require('axios');
const args = process.argv;
const appName = args[2];
const environment = args[3];
const ADMIN_AUTH = process.env.ADMIN_AUTH;
let baseURL;
let Host;

let ENVIRONMENTS = {
    LOCAL: 'LOCAL',
    STAGING: 'STAGING'
}

// App Name set?
if (!appName) {
    console.log('Please pass the app name as the first argument.');
    console.log('\n   npm run seed <app-name>\n');
    process.exit();
}

// Environment set?
if (!environment) {
    console.log(`Please pass the environment as the first argument: "${ENVIRONMENTS.LOCAL}" or "${ENVIRONMENTS.STAGING}"\n`);
    console.log('\n   npm run seed <environment>\n');
    process.exit();
}

// Set the baseUrl
if (environment === ENVIRONMENTS.LOCAL) {
    baseURL = 'http://localhost:3000';
} else if (environment === ENVIRONMENTS.STAGING) {
    baseUrl = 'https://agnostic-api.com';
} else {
    console.log(`Environment argument is invalid. Should be either "${ENVIRONMENTS.LOCAL}" or "${ENVIRONMENTS.STAGING}"\n`);
    process.exit();
}

// Set the Host 
Host = (() => {
    switch (appName) {
        case 'DEV_DREAMYDC': return 'dev-dreamydc';
        case 'TOPROCKLABS': return 'toprocklabs';
        default:
            console.log('App not found. Try again.\n');
            process.exit();
            break;
    }
})();

// Create axios object
const axios = AXIOS.create({
    baseURL,
    headers: { Host }
});

// ADMIN AUTH CONFIG
let adminConfig = {
    headers: {
        Auth: ADMIN_AUTH,
    }
};

// Add shop
const addShops = async function (count) {
    for (i of new Array(count)) {
        const shop = {
            name: 'Dreamy',
            openHour: 8,
            closeHour: 22
        };
        // console.log({shop});
        axios.post('/shops', shop, adminConfig);
    }
    console.log(`added ${count} shop(s)`);
};

// Add users
const addUsers = async function (count) {
    for (i of new Array(count)) {
        const user = {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            email: faker.internet.email(),
            phoneNumber: faker.phone.phoneNumber('240#######')
        };
        // console.log({user});
        axios.post('/users', user);
    }
    console.log(`added ${count} user(s)`);
}

// Add products
const addProducts = async function (count) {
    for (i of new Array(count)) {
        const product = {
            name: faker.commerce.productName().split(' ')[0],
            price: Math.round(faker.commerce.price())
        }
        // console.log({product});
        axios.post('/products', product, adminConfig);
    }
    console.log(`added ${count} product(s)`);
};


// Add everything to database
const seed = async function () {
    try {
        await addShops(1);
        await addUsers(20);
        await addProducts(4);
        console.log('and finished seed.');
    } 
    catch (error) {
        console.log({error: error.response.data});
    }
}

seed();