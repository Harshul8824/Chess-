class AppError extends Error{
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;//this.isOperational = true marks an error as a known, predictable problem (like a wrong password or 404 not found) rather than a critical system crash.

        //capture the stack trace
        Error.captureStackTrace(this, this.contructor) //Error.captureStackTrace cleans up your error logs by hiding the internal code of your custom AppError class. This ensures the stack trace points directly to the exact route or controller line where the error actually occurred.
    }
}

export default AppError;