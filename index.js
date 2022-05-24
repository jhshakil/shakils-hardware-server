const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORd}@cluster0.uz8kq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('shakilsHardware').collection('products');
        const reviewCollection = client.db('shakilsHardware').collection('reviews');
        const orderCollection = client.db('shakilsHardware').collection('orders');

        app.get('/product', async (req, res) => {
            const query = {};
            const product = await productCollection.find(query).toArray();
            res.send(product);
        })
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        })

        app.get('/review', async (req, res) => {
            const query = {};
            const review = await reviewCollection.find(query).toArray();
            res.send(review);
        })

        app.get('/myOrder', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const myOrder = await orderCollection.find(query).toArray();
            res.send(myOrder);
        })

        app.post('/order', async (req, res) => {
            const data = req.body;
            const order = await orderCollection.insertOne(data)
            res.send(order);
        })

        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deleted = await orderCollection.deleteOne(query);
            res.send(deleted);
        })
    }
    finally {

    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})