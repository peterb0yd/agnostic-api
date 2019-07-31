/* DELETE */

const redisClients = require("../lib/redis");

module.exports = {
    /**
     * Handle all DELETE requests
     */
    deleteHandler: function (req, res) {
        const {path} = req;
        res.json({path});

        // Broadcast if needed
        if (req.instanceModel.broadcast) {
            broadcast.send(req.bodyInstance, req.instanceModel, req.method);
        }
    }

}