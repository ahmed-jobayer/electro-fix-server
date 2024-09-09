const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server of Electro Fix is running");
});

app.listen(port, () => {
  console.log(`Server of Electro Fix is running on port ${port}`);
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.oapnwos.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const servicesCollection = client.db("ElectroFixDB").collection("services");
    const bookedServicesCollection = client
      .db("ElectroFixDB")
      .collection("bookedServices");

    // get requests

    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
      // console.log('request received')
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const cursor = await servicesCollection.findOne(query);
      res.send(cursor);
    });

    // user wise added services

    app.get("/provider/services", async (req, res) => {
      const email = req.query.currentUserEmail;
      // console.log(email);
      if (!email) {
        res.status(404).send({ error: "email not found" });
      }
      const query = { providerEmail: email };
      const cursor = servicesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // provider email wise booked services

    app.get("/providerEmail/services", async (req, res) => {
      const email = req.query.currentUserEmail;
      // console.log(email);
      if (!email) {
        res.status(404).send({ error: "email not found" });
      }
      const query = { providerEmail: email };
      const cursor = bookedServicesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // user wise booked services

    app.get("/bookedServices", async (req, res) => {
      const email = req.query.currentUserEmail;
      // console.log(email);
      if (!email) {
        res.status(400).send({ error: "email not found" });
      }
      const query = { currentUserEmail: email };
      const cursor = bookedServicesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // post request

    app.post("/services", async (req, res) => {
      const newService = req.body;
      const result = await servicesCollection.insertOne(newService);
      res.send(result);
    });

    app.post("/bookings", async (req, res) => {
      const newBooking = req.body;
      const result = await bookedServicesCollection.insertOne(newBooking);
      res.send(result);
    });

    // update operations

    app.patch('/provider/service/:id', async (req, res) => {
      const id = req.params.id;
      const updateService = req.body;
      // console.log(id, updateService)
      const filter = {_id: new ObjectId(id)}
      const updateDoc = {
        $set: updateService
      }
      const result = await servicesCollection.updateOne(filter, updateDoc)
      res.send(result)
    })

    // booked services status update

    app.patch('/updateBookedService/:id', async (req, res) => {
      const id = req.params.id
      const status = req.body.status

      if (!status) {
        res.status(400).send({error: 'Status is required'})
      }

      try{
        const filter = { _id: new ObjectId(id)};
        const updateDoc = {
          $set: {status}
        }

        const result = await bookedServicesCollection.updateOne(filter, updateDoc)
        res.send(result)
      }
      catch(err) {
        console.error('Error updating booked service status', err);
        res.status(500).send({error: 'Failed to update service status'})
      }
    })

    // delete operatins

    app.delete("/provider/services/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await servicesCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



