const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000
//w9DJilBhllnhcWcR

//middlewares
app.use(cors())
app.use(express.json())


const uri = "mongodb+srv://mastermind:w9DJilBhllnhcWcR@artify.ndgtchi.mongodb.net/?appName=Artify";

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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");


    const db = client.db('artwork-db')
    const artworkCollection = db.collection('artworks')


    app.get('/artworks', async (req, res) => {
      const result = await artworkCollection.find().sort({ createdAt: -1 }).limit(6).toArray();
      res.send(result)
    })

    app.get('/allartworks', async (req, res) => {
      const result = await artworkCollection.find().sort({ createdAt: -1 }).toArray();
      res.send(result)
    })


    app.get('/artworks/:id', async (req, res) => {
      const { id } = req.params
      const result = await artworkCollection.findOne({ _id: new ObjectId(id) })
      res.send(result)
    })

    app.post("/artworks", async (req, res) => {
      const artwork = req.body;
      const result = await artworkCollection.insertOne(artwork);
      res.send(result);
    });


    app.patch("/artworks/:id/likes", async (req, res) => {
      const { id } = req.params;

      try {
        const result = await artworkCollection.updateOne(
          { _id: new ObjectId(id) },
          { $inc: { likes: 1 } } // ✅ Increase by 1
        );

        res.json({ success: true, message: "Like added!" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Failed to like artwork" });
      }
    });


    // ✅ Get artworks by user email
    // POST /my-artworks
    app.post("/my-artworks", async (req, res) => {
      try {
        const { email } = req.body; // get email from request body
        if (!email) return res.status(400).json({ error: "Email is required" });

        const result = await artworkCollection.find({ user_email: email }).toArray();
        res.json(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch artworks" });
      }
    });



    // ✅ Delete an artwork
    app.delete("/my-artworks/:id", async (req, res) => {
      const { id } = req.params;
      const result = await artworkCollection.deleteOne({ _id: new ObjectId(id) });
      res.json({ success: result.deletedCount > 0 });
    });

    // ✅ Update an artwork
    app.patch("/my-artworks/:id", async (req, res) => {
      const { id } = req.params;
      const updated = req.body;
      const result = await artworkCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updated }
      );
      res.json({ success: result.modifiedCount > 0 });
    });



  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
