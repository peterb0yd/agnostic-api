/* GET */

const {getInstance, getInstances, getInstanceFromIndex, getInstancesFromIndex, listInstances, isEmpty, errorHandler} = require('../lib/utils');

module.exports = {
    /**
     * Handle all GET requests
     */
    getHandler: async function (req, res) {
        try {

            let instance;
            let instances;
            const matchingInstances = [];
            const expiration = req.instanceModel.expiration;
            const { db, modelName } = req;

            console.log({id: req.params.id});
            console.log({query: req.query});

            // Has ID?
            if (req.params.id) {
                const id = req.params.id;
                instance = await getInstance({ db, modelName, id });
                res.json(instance);
                return;
            }

            // No query params? Provide LIST
            else if (isEmpty(req.query) || !!req.query.limit || !!req.query.offset) {
                const offset = parseInt(req.query.offset) || 0;
                let limit = parseInt(req.query.limit) || 25;
                let newOffset = offset + limit;
                limit = limit > 0 ? limit-1 : 0; // subtract 1 to account for CS counting
                
                // Grab all instances given limit & offset
                instances = await listInstances({ db, modelName, expiration, offset, limit });

                // Set newOffset if length is too small
                newOffset = !isEmpty(instances) && instances.length < newOffset ? offset + instances.length : newOffset;
                limit++; // return original limit to client

                // Return list
                res.json({ instances, newOffset, limit });
                return;
            }

            // Has query params?
            else { 
                for (const [queryName, queryValue] of Object.entries(req.query)) {
                    const fieldOptions = req.instanceModel.fields[queryName];
                    const isIdentifier = queryName === 'id';
                    let valueArray = [];

                    // Collect all values in array
                    if (typeof queryValue === 'object') {
                        valueArray = Array.from(queryValue);
                        console.log({valueArray});
                    }

                    // Is the query param a single value?
                    if (isEmpty(valueArray)) {

                        // Check if the query param is an identifier 
                        if (isIdentifier) {
                            const id = queryValue;
                            instance = await getInstance({ db, modelName, id });
                        }
                        
                        // Get from Index
                        else if (fieldOptions && fieldOptions.index) {
                            const indexField = queryName, indexValue = queryValue; 
                            instance = await getInstanceFromIndex({ db, modelName, indexField, indexValue });
                        } 
                        
                        // Not an indexed field... send warning
                        else {
                            res.send('warning... this is going to be a bad query');
                            return;
                        }

                        // Add to array of instances
                        matchingInstances.push(instance);

                    } 
                    
                    // Is the query param an array value?
                    else {

                        // Get all from ID list
                        if (isIdentifier) {
                            console.log({isIdentifier, valueArray});
                            const ids = valueArray;
                            instances = await getInstances({ db, modelName, ids });
                            console.log({instances});
                        }

                        // Get all instances from index values 
                        else if (fieldOptions && fieldOptions.index) {
                            const indexField = queryName, indexValues = valueArray;
                            instances = await getInstancesFromIndex({ db, modelName, indexField, indexValues });
                        }

                        // Not an indexed field... send warning
                        else {
                            res.send('warning... this is going to be a really bad query');
                            return;
                        }

                        // Add to array of instances
                        matchingInstances.push(instances);
                    }
                }

                res.json({queries: req.query, instances: matchingInstances});
                return;
            }

        } 
        catch (error) {
            errorHandler(req, res, error);
            return;
        }
    }

}