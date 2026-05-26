//built simple server
const { default: mongoose } = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');

//give path to config.env
dotenv.config({ path: './config.env' });

const DB = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD);

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(DB);
    console.log("Database connect successfully");
    // console.log(con.connections);
}

const port = process.env.PORT;
const server = app.listen(port, () => {
    console.log(`server is run on ${port} successfully`);
});

