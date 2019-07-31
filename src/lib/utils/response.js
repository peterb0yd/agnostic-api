
// * Public functions

/**
 * errorHandler - log the error and return error to client
 * 
 * @param {*} req - the request object
 * @param {*} res - the response object
 * @param {*} error - the error object
 */
exports.errorHandler = function (req, res, error) {
    console.log({error});
    res.status(400).json({
        error, 
        body: req.body, 
        instance: req.instance
    });
    return;
}