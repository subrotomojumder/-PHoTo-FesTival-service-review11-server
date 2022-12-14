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

// jwt verify middleware
function jwtVerify(req, res, next) {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.WEB_SECRET_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    const serviceCollection = client.db("service-review").collection("service");
    const reviewCollection = client.db("service-review").collection("reviews");
    try {
        // get json web token 
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.WEB_SECRET_TOKEN, { expiresIn: '1d' });
            res.send({ token })
        })
        // service create api
        app.post('/services', async (req, res) => {
            const service = req.body;
            const results = await serviceCollection.insertOne(service);
            res.send(results);
        })
        // get services api
        app.get('/services', async (req, res) => {
            const limit = parseInt(req.query.limit);
            const query = {};
            const cursor = serviceCollection.find(query);
            let services;
            if (limit) {
                services = await cursor.limit(limit).toArray();
            } else {
                services = await cursor.toArray();
            }
            res.send(services);
        })
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })
        // create review api
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const results = await reviewCollection.insertOne(review);
            res.send(results);
        })
        //get review api
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { serviceId: id };
            const reviews = await reviewCollection.find(query).toArray();
            res.send(reviews);
        })
        app.get('/reviews', jwtVerify, async (req, res) => {
            const decoded = req.decoded.user;
            const user = req.query.email;
            if (decoded !== user) {
                res.status(403).send({message : 'unauthorized access'})
            }
            const query = { reviewerEmail: user }
            const reviews = await reviewCollection.find(query).toArray();
            res.send(reviews);
        })
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const results = await reviewCollection.deleteOne(query);
            res.send(results);
        })
        app.patch('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const review = req.body;
            const filter = { _id: ObjectId(id) };
            const updateReview = {
                $set: review
            };
            const results = await reviewCollection.updateOne(filter, updateReview);
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