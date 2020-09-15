/**
	 * print json response to client
	 * @param String status_code Http response code
	 * @param Int response Json response
	 */
    
printResponse = function (res, status_code, message, status) {

    res.status(status_code);
    res.contentType('application/json');
    res.status(status_code).json({ status: status, response: message })
    return;
}

module.exports = {
    printResponse: printResponse
}