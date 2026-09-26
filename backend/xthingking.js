// Planning note for the POST /api/returns endpoint.
// The request identifies the rental with a customer ID and movie ID.

// Negative cases verify authentication, validation, missing rentals, and repeats.

//Return 401 if client is not loggedIn
//Return if customerId is not provided
//Return 400 if movieId is not provided
//Return 404 if no rental found for this customer/movie
//Return 400 if rental already processed

// Positive cases verify the response, return date, fee, stock, and rental payload.

//Return 200 if valid request
//Set the Return date
// Calculate the rental fee
//Increase the stock
//Return the rental

// These cases were later implemented incrementally in the integration test suite.
