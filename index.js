const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');
// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());




// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
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
     const db = client.db("MeowVerse");
      const  usersCollection = db.collection("user");  
       const  blogsCollection = db.collection("blog");  
        const  catsCollection = db.collection("cats");

// user ger for all 
app.get("/user", async (req, res) => {
const result = await usersCollection.find().toArray()
      res.send(result) 
});

// user get by email
app.get('/user/:email',async(req,res)=>{
  const email = req.params.email;
  if (!usersCollection) return res.status(503).send("Database not connected");
  try {
    const user = await usersCollection.findOne({ email: email });
    if (!user) return res.status(404).send("User not found");
    res.send(user);
  } catch (error) {
    console.error("❌ Error in /user/:email:", error);
    res.status(500).send("Internal Server Error");
  }
});

// applied for seller
app.patch('/user/applied/:email',async(req,res)=>{
  const email = req.params.email;
  const filter = { email: email };
  const data=req.body
  if (!usersCollection) return res.status(503).send("Database not connected");
  const updateDoc = {
    $set: {
      applied: true,
      ...data,
      last_loggedIn: new Date().toISOString(),
    },
  };

  try {
    const result = await usersCollection.updateOne(filter, updateDoc);
    if (result.modifiedCount > 0) {
      res.status(200).send({ message: "User role updated to seller", result });
    } else {
      res.status(404).send({ message: "User not found or already applied" });
    }
  } catch (error) {
    console.error("❌ Error in /user/applied:", error);
    res.status(500).send("Internal Server Error");
  }
}
)

    //   user post 
    app.post("/user", async (req, res) => {
  if (!usersCollection) return res.status(503).send("Database not connected");

  try {
    const userData = req.body;
    userData.role = "user";
    userData.created_at = new Date().toISOString();
    userData.last_loggedIn = new Date().toISOString();

    const query = { email: userData.email };
    const alreadyExists = await usersCollection.findOne(query);

    if (alreadyExists) {
      const result = await usersCollection.updateOne(query, {
        $set: { last_loggedIn: new Date().toISOString() },
      });
      return res.send(result);
    }

    const result = await usersCollection.insertOne(userData);
    res.send(result);
  } catch (error) {
    console.error("❌ Error in /user:", error);
    res.status(500).send("Internal Server Error");
  }
});


// blog all get
app.get('/blog',async(req,res)=>{
  const result = await blogsCollection.find().toArray()
      res.send(result) 
});
// get all cat 
app.get('/cats',async(req,res)=>{
  const result = await catsCollection.find().toArray()
      res.send(result) 
});
// cats post 
app.post('/cats',async(req,res)=>{
  const catData = req.body;
  if (!catsCollection) return res.status(503).send("Database not connected");

  try {
    catData.created_at = new Date().toISOString(); 
    const result = await catsCollection.insertOne(catData);
    res.send(result);
  } catch (error) {
    console.error("❌ Error in /cats:", error);
    res.status(500).send("Internal Server Error");
  }
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


// Sample route
app.get('/', (req, res) => {
    res.send('MeowVerse is running');
});

// Start the server
app.listen(port, () => {
    console.log(`🚀 Server is listening on port ${port}`);
});