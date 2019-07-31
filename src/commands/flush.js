
const redisClients = require('../lib/redis');
const args = process.argv;
const appName = args[2];

if (!appName) {
    console.log('Please pass the app name as the first argument.');
    console.log('\n   npm run seed <app-name>\n');
    process.exit();
}

const db = redisClients[appName];

if (!db) {
    console.log('We couldn\'t find the app name that you typed. Please check the app name spelling.\n');
    process.exit();
}

async function flush () {
    console.log('...flushing database');
    await db.flushdb();
    console.log('Database flushed successfully.\n');
    process.exit();
}

flush();
