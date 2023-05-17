const express = require('express')
const app = express()
const jwt =  require('jsonwebtoken');  //require('crypto').randomBytes(64).toString('hex')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 5000

//middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xvcivem.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const servicesCollection = client.db('carCaringZone').collection('services')
    const bookingCollection = client.db('carCaringZone').collection('bookingServices')

    app.get('/services', async(req, res) => {
      const cursor = servicesCollection.find()
      const result = await cursor.toArray()
      res.send(result); 
    })

    app.get('/services/:id', async(req, res) =>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await servicesCollection.findOne(query)
      res.send(result)
    })

    // booking 
    app.post('/booking', async(req, res) =>{
      const booking = req.body
      const result = await bookingCollection.insertOne(booking)
      res.send(result)
    })

    app.get('/booking', async(req, res) => {
      let query = {}
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const cursor = bookingCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })

    app.delete('/booking/item/:id', async(req, res) =>{
      const id = req.params.id;
      console.log(id);
      const query = {_id: new ObjectId(id)}
      const result = await bookingCollection.deleteOne(query)
      res.send(result)
    })

    app.patch('/booking/:id', async(req, res) => {
      const id =req.params.id;
      const query = {_id: new ObjectId(id)};
      const updateBooking = req.body;
      const updateDoc = {
        $set: {
          status: updateBooking.status
        }
      };
      const result = await bookingCollection.updateOne(query, updateDoc);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Car caring zone!')
})

app.listen(port, () => {
  console.log(`car caring zone running on port ${port}`)
})