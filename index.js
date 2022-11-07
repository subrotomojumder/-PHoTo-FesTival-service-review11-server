const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

async function run(){
    try{
        app.get('/', async(req, res)=> {
            res.send('service review assignment running')
        })
    }
    catch(err){
        console.log(err.stack);
        console.log(err.message);
    }
}
run().catch(err => console.log(err));

app.listen(port, ()=> {
    console.log('server port :', port)
})