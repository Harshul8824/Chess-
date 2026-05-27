//built simple server
const { default: mongoose } = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');
const connnectDB = require('./Databases/db');

//give path to config.env
dotenv.config({ path: './config.env' });

const DB = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD);
const port = process.env.PORT || 8000;


const startServer = async () => {
    try {
        await connnectDB;

        const server = app.listen(port, () => {
            console.log(`♟️  Chess server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

            // Handle unhandled promise rejections
            process.on('unhandledRejection', (err) => {
            console.error('UNHANDLED REJECTION ❌', err.message);
            server.close(() => process.exit(1));
            });

            // Handle uncaught exceptions
            process.on('uncaughtException', (err) => {
            console.error('UNCAUGHT EXCEPTION ❌', err.message);
            process.exit(1);
            });
        })
    }catch(err){
            console.error('Server failed to start ❌', err.message);
            process.exit(1);
    }
};

startServer();

