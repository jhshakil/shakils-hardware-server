const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORd}@cluster0.uz8kq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ massage: 'Unauthorize access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ massage: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    });

}

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('shakilsHardware').collection('products');
        const reviewCollection = client.db('shakilsHardware').collection('reviews');
        const orderCollection = client.db('shakilsHardware').collection('orders');
        const profileCollection = client.db('shakilsHardware').collection('profiles');
        const userCollection = client.db('shakilsHardware').collection('users');

        const verifyAdmin = async (req, res, next) => {
            const requester = req.decoded.email;
            const requestAccount = await userCollection.findOne({ email: requester });
            if (requestAccount.role === 'admin') {
                next();
            } else {
                return res.status(403).send({ massage: 'Forbidden access' });
            }
        }

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

        app.get('/myOrder', verifyToken, async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const myOrder = await orderCollection.find(query).toArray();
            res.send(myOrder);
        })
        app.get('/order', verifyToken, async (req, res) => {
            const query = {};
            const myOrder = await orderCollection.find(query).toArray();
            res.send(myOrder);
        })
        app.get('/user', verifyToken, async (req, res) => {
            const query = {};
            const myOrder = await userCollection.find(query).toArray();
            res.send(myOrder);
        })
        app.get('/profile', verifyToken, async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const profile = await profileCollection.findOne(query);
            res.send(profile)
        })

        app.get('/admin/:email', verifyToken, async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin });
        })

        app.post('/order', async (req, res) => {
            const data = req.body;
            const order = await orderCollection.insertOne(data)
            res.send(order);
        })

        app.post('/review', async (req, res) => {
            const allData = req.body;
            const review = await reviewCollection.insertOne(allData);
            res.send(review);
        })
        app.post('/product', async (req, res) => {
            const allData = req.body;
            const review = await productCollection.insertOne(allData);
            res.send(review);
        })

        app.post('/profile', async (req, res) => {
            const allData = req.body;
            const profile = await profileCollection.insertOne(allData);
            res.send(profile);
        })

        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const updateData = req.body;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: updateData.available
                }
            }
            const result = await productCollection.updateOne(query, updateDoc, options);
            res.send(result)
        })
        app.put('/editProduct/:id', async (req, res) => {
            const id = req.params.id;
            const updateData = req.body;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updateData.name,
                    description: updateData.description,
                    minOrder: updateData.minOrder,
                    quantity: updateData.quantity,
                    price: updateData.price
                }
            }
            const result = await productCollection.updateOne(query, updateDoc, options);
            res.send(result)
        })
        app.put('/profile/:email', async (req, res) => {
            const email = req.params.email;
            const updateData = req.body;
            const query = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updateData.name,
                    location: updateData.location,
                    education: updateData.education,
                    linkedin: updateData.linkedin,
                    number: updateData.number
                }
            }
            const result = await profileCollection.updateOne(query, updateDoc, options);
            res.send(result)
        })

        app.put('/picture/:email', async (req, res) => {
            const email = req.params.email;
            const updateData = req.body;
            const query = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    img: updateData.img,
                }
            }
            const result = await profileCollection.updateOne(query, updateDoc, options);
            res.send(result)
        })

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const query = { email: email };
            const option = { upsert: true };
            const updateDoc = {
                $set: user
            }
            const result = await userCollection.updateOne(query, updateDoc, option);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: '365d' })
            res.send({ result, token });
        })

        app.put('/user/admin/:email', verifyToken, verifyAdmin, async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const updateDoc = {
                $set: { role: 'admin' }
            }
            const result = await userCollection.updateOne(query, updateDoc);
            return res.send(result);
        })

        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deleted = await orderCollection.deleteOne(query);
            res.send(deleted);
        })
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deleted = await productCollection.deleteOne(query);
            res.send(deleted);
        })
    }
    finally {

    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('This is Shakils Hardware')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})