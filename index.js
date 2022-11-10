const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const reviewCollection = client.db("service-review").collection("reviews");
    try {
        // get json web token 
        app.post('/jwt', async(req, res)=> {
            const user = req.body;
            console.log(user)
        })
        // service create api
        
        // get services api
        app.get('/services', async (req, res) => {
            const limit = parseInt(req.query.limit);
            const query = {};
            const cursor = serviceCollection.find(query);
            let services;
            if (limit) {
                services = await cursor.limit(limit).toArray();
            }else{
                services = await cursor.toArray();
            }
            res.send(services);
        })
        app.get('/services/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })
        // create review api
        app.post('/reviews', async(req, res)=> {
            const review = req.body;
            const results = await reviewCollection.insertOne(review);
            res.send(results);
        })
        //get review api
        app.get('/reviews/:id', async(req, res)=> {
            const id = req.params.id;
            const query = {serviceId: id};
            const reviews = await reviewCollection.find(query).toArray();
            res.send(reviews);
        })
        app.get('/reviews', async(req, res)=> {
            const user = req.query.email;
            const query = {reviewerEmail: user}
            const reviews = await reviewCollection.find(query).toArray();
            res.send(reviews);
        })
        app.delete('/reviews/:id', async(req, res)=> {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const results = await reviewCollection.deleteOne(query);
            res.send(results);
        })
        app.patch('/reviews/:id', async(req, res)=>{
            const id = req.params.id;
            const review = req.body;
            const filter = {_id: ObjectId(id)};
            const updateReview = {
                $set: review
            };
            const results =  await reviewCollection.updateOne(filter, updateReview);
            res.send(results);
        })
        
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