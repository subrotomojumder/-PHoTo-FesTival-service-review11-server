const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uxk5wr6.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    const serviceCollection = client.db("service-review").collection("service");
    try {
        app.get('/', async (req, res) => {
            res.send('service review assignment running')
        })
    }
    catch (err) {
        console.log(err.stack);
        console.log(err.message);
    }
}
run().catch(err => console.log(err));

app.listen(port, () => {
    client.connect(err => {
        if (err) {
            console.log('database connection err')
        }
        else {
            console.log('server port :', port)
        }
    });
})