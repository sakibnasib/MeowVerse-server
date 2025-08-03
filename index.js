const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// Load environment variables from .env file
dotenv.config();
const stripe = require('stripe')(process.env.STRIPE_SK_KEY)
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
        const catfoodsCollection=db.collection("catfood");
        const ordersCollection=db.collection("order");
         const paymentsCollection=db.collection("payment");


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
  data.status ='Pending'
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
  const result = await catsCollection.find() .sort({ createdAt: -1 }).limit(8).toArray()
      res.send(result) 
});
app.get('/allcats', async (req, res) => {
  const { search = '', sort = '', page = 1, limit = 8 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = {
    $or: [
      { breed: { $regex: search, $options: 'i' } },
      { color: { $regex: search, $options: 'i' } }
    ]
  };

  const sortOption =
    sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};

  const data = await catsCollection.find(query).sort(sortOption).skip(skip).limit(parseInt(limit)).toArray();
  const total = await catsCollection.countDocuments(query);

  res.send({ data, total });
});
// get seller all cats 
app.get('/seller/allcats/:email', async (req, res) => {
  if (!catsCollection) return res.status(503).send("Database not connected");

  const { email } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const query = { sellerEmail: email };
    const totalCount = await catsCollection.countDocuments(query);
    
    const result = await catsCollection
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const hasMore = skip + result.length < totalCount;

    res.send({
      cats: result,
      totalCount,
      page,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching seller cats:", error);
    res.status(500).send("Internal Server Error");
  }
});

// single cat get by id
app.get('/cats/:id',async(req,res)=>{
  const id = req.params.id;
  if (!catsCollection) return res.status(503).send("Database not connected");
  try {
    const cat = await catsCollection.findOne({ _id: new ObjectId(id) });
    if (!cat) return res.status(404).send("Cat not found");
    res.send(cat);
  } catch (error) {
    console.error("❌ Error in /cats/:id:", error);
    res.status(500).send("Internal Server Error");
  }
})
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
// get 8 food for home page 
app.get('/foods',async(req,res)=>{
  const result = await catfoodsCollection.find() .sort({ createdAt: -1 }).limit(8).toArray()
      res.send(result) 
});

// get all foodspagination
app.get('/allfoods',async(req,res)=>{
  const { search = '', sort = '', page = 1, limit = 8 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = {
    $or: [
      { name: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ]
  };
const sortOption =
    sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};
const data = await catfoodsCollection.find(query).sort(sortOption).skip(skip).limit(parseInt(limit)).toArray();
  const total = await catfoodsCollection.countDocuments(query);
res.send({ data, total });
})

// single food
app.get('/foods/:id',async(req,res)=>{
 const id = req.params.id;
  if (!catfoodsCollection) return res.status(503).send("Database not connected");
  try {
    const cat = await catfoodsCollection.findOne({ _id: new ObjectId(id) });
    if (!cat) return res.status(404).send("Cat not found");
    res.send(cat);
  } catch (error) {
    console.error("❌ Error in /cats/:id:", error);
    res.status(500).send("Internal Server Error");
  }
});


// get seller all catfoo 
app.get('/seller/allfood/:email', async (req, res) => {
  if (!catsCollection) return res.status(503).send("Database not connected");

  const { email } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const query = { sellerEmail: email };
    const totalCount = await catfoodsCollection.countDocuments(query);
    
    const result = await catfoodsCollection
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const hasMore = skip + result.length < totalCount;

    res.send({
      foods: result,
      totalCount,
      page,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching seller cats:", error);
    res.status(500).send("Internal Server Error");
  }
});

// catfoods post
app.post('/catfoods',async(req,res)=>{
  const data=req.body
  try{
     data.created_at = new Date().toISOString();
  const result= await catfoodsCollection.insertOne(data);
  res.send(result);
  }catch (error) {
    console.error("❌ Error in /cats:", error);
    res.status(500).send("Internal Server Error");
  }
})

// for user 
app.get('/order/:email', async (req, res) => {
  if (!ordersCollection)
    return res.status(503).send('Database not connected');

  const { email } = req.params;
  const { status } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const query = {
      buyer: email,
    };

    if (status) {
      // Use case-insensitive matching for status
      query.status = new RegExp(`^${status}$`, 'i');
    }

    const totalCount = await ordersCollection.countDocuments(query);

    const bookings = await ordersCollection
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    res.send({ totalCount, bookings });

  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).send('Internal Server Error');
  }
});

// for seller on his own order approve
app.get('/sellerorder/:email', async (req, res) => {
  if (!ordersCollection)
    return res.status(503).send('Database not connected');

  const { email } = req.params;
  const { status } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const query = {
      sellerEmail: email,
    };

    if (status) {
      // Use case-insensitive matching for status
      query.status = new RegExp(`^${status}$`, 'i');
    }

    const totalCount = await ordersCollection.countDocuments(query);

    const bookings = await ordersCollection
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    res.send({ totalCount, bookings });

  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).send('Internal Server Error');
  }
});

// status chang by seller 
app.patch('/orders/:orderId', async (req, res) => {
  if (!ordersCollection) {
    return res.status(503).send('Database not connected');
  }

  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const query = { _id: new ObjectId(orderId) };
    const update = { $set: { status } };

    const result = await ordersCollection.updateOne(query, update);

    if (result.modifiedCount === 0) {
      return res.status(404).send('Order not found or already updated');
    }

    console.log(`✅ Order ${orderId} status updated to ${status}`);
    res.send({ success: true, message: 'Order status updated' });
  } catch (error) {
    console.error('❌ Error updating order:', error);
    res.status(500).send('Internal Server Error');
  }
});



// order post for user 
app.post('/orders',async(req,res)=>{
   const data=req.body  
  try{
     data.created_at =new Date().toISOString();
 data.status ='Pending'
  const result= await ordersCollection.insertOne(data);
  res.send(result);
  }catch (error) {
    console.error("❌ Error in /orders:", error);
    res.status(500).send("Internal Server Error");
  }
})

// delete paniding order by user 
app.delete("/order/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await ordersCollection.deleteOne({
      _id: new ObjectId(id),
    });
    res.send(result);
  } catch (error) {
    console.error("❌ Error deleting booking:", error);
    res.status(500).send("Internal Server Error");
  }
});






// 
// --- Route: Create Payment Intent ---
app.post('/create-payment-intent', async (req, res) => {
  const { orderId,  quantity,deliveryCharge } = req.body
      const itams = await ordersCollection.findOne({
        _id: new ObjectId(orderId),
      })
      const des=deliveryCharge * 100
      if (!itams) return res.status(404).send({ message: 'Plant Not Found' })
      const Price = quantity *itams?.singlepicePrice  * 100
    const totalPrice=Price + des
    console.log(itams?.singlepicePrice,quantity,deliveryCharge)
    console.log(totalPrice)
      // stripe...
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalPrice, // Convert to cents
    currency: 'usd',
    payment_method_types: ['card'],
  });

  res.send({ clientSecret: paymentIntent.client_secret });
});

// payments post to make payment data 
app.post('/payments',async(req,res)=>{
  const data=req.body
   try{
     data.created_at =new Date().toISOString();
       const orderId =data.orderId; 

    if (orderId) {
      await ordersCollection.updateMany(
        { _id: new ObjectId(orderId) },
        { $set: { status: "confirmed",
           confirmedcreated_at: new Date().toISOString()
         } }
      );
    }
  const result= await paymentsCollection.insertOne(data);
  res.send(result);
  }catch (error) {
    console.error("❌ Error in /orders:", error);
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