//built simple server
const app = require('./app');
const dotenv = require('dotenv');

//give path to config.env
dotenv.config({path : './config.env'});

const port = process.env.PORT;
const server = app.listen(port, () => {
    console.log(`server is run on ${port} successfully`);
});

