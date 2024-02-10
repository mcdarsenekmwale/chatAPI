/**
	 * print json response to client
	 * @param String status_code Http response code
	 * @param Int response Json response
	 */
    
const printResponse = function (res, status_code, message, status) {

    res.status(status_code);
    res.type('application/json');
    res.status(status_code).json(
         message
    )
    return;
}

const printError = function (res, err) {
    let errStatus = err.status || 500;
    res.type('application/json');
    res.status(errStatus).json(
        {
            title: err.name || errStatus,
            message: `${err.message} ${err.error}`,
            stack: process.env.DEBUG? err.stack:""
        }
    )
    return;
}



class ResponseUtil{
    constructor() {
        
    }

    /**
     * print json response to client
     * @param String status_code Http response code
     * @param Int response Json response
     */
    static printJSON(req, res, status_code, data){
        if(!data){
            // if no data is provided then send a empty object
            data = {};
        }else if (!data instanceof Object){
            // If the data is not an instance of object then convert it into one
            try{
                data = JSON.parse(data);
            }catch(e){
                console.error("Failed to parse data into JSON");
                printError(res, e);
                return;
            }
            
        }else{
            // do nothing as data is already an object
        }
        res.setHeader("Content-Type", "application/json");
        res.status(status_code);
        res.send(JSON.stringify(data));
    }

    /**
     * Redirects user to another page with optional parameters
     *  
     * @param {Object} req Express request object
     * @param {Object} res Express response object 
     * @param {String} url URL to redirect to
     * @param {Number} httpStatusCode HTTP Status Code for redirection (default:302)
     */
    static redirect(req, res, url, httpStatusCode=302){
        res.status(httpStatusCode );
        res.set({ 'Location': url });
        res.send();
        
    }

    //unauthorized response without any message
    static unauthorizedResponse(req, res, result) {
        ResponseUtil .printJSON(req, res, 401, {header: "Unauthorized", message: result.message});
    }

    //forbidden response
    static forbiddenResponse(req, res, result) {
        ResponseUtil.printJSON(req, res, 403, {message: "Forbidden "+result.message});
    }

    //server error
    static serverError(res, error){
        let statusCode = 500;
        if(error && error.statusCode){
            statusCode = error.statusCode;
        }
         printError(res, {message:`Server Error ${error}`}, );
    }

    //bad request response
    static badRequestResponse(res, error){
        printError(res, {message:"Bad Request!", error: error.message, status:400 });
    }

    //not found response
    static notFoundResponse(res, error){ 
        printResponse(res, 404, error.message ? {
            message: error.message
        } :
            new Error({ message: "Resource Not Found", status: 404, error: error }));
    }

    /**
     * Print the JSON response with given parameters and send it as a response.
     * @param {Object} req Express request object.
     * @param {Object} res Express response object.
     * @param {Number} status HTTP Status code of the response.
     * @param {Object} data Data to be sent in the body of the response.
     */
}

module.exports = {
    printResponse,
    printError,
    ResponseUtil
}