/* PUT */

const redisClients = require("../lib/redis");

module.exports = {
    /**
     * Handle all PUT requests
     */
    putHandler: function (req, res) {
        const {path} = req;
        res.json({path});
    }

}