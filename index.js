const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
console.log(ObjectId);
var cors = require("cors");
require("dotenv").config();
const nodemailer = require("nodemailer");
const app = express();
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());
//connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.trtrt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
//function to connect mongoDb
async function run() {
  try {
    await client.connect();
    //console.log("connected to database");
    const database = client.db("TourOfferDb");
    const packagesCollection = database.collection("packages");
    const ordersCollection = database.collection("orders");
    //  console.log("connected to database");
    //get api
    app.get("/packages", async (req, res) => {
      const cursor = packagesCollection.find({});
      const packages = await cursor.toArray();
      res.send(packages);
    });
    // GET DYNAMIC API
    app.get("/packages/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const package = await packagesCollection.findOne(query);
      res.json(package);
    });
    // post to insert
    app.post("/packages", async (req, res) => {
      const package = req.body;
      const result = await packagesCollection.insertOne(package);
      res.json(result);
    });
    // post to insert
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      // console.log("my dream email", order?.data?.email);
      res.json(result);
      // send order mail information
      sendMail(order?.data?.email);
    });
    //get api
    app.get("/orders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });
    //update Api value
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "Approved",
        },
      };
      const result = await ordersCollection.updateOne(
        query,
        updateDoc,
        options
      );

      console.log(result);
    });

    // DELETE API
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
// bulk mail send
const sendMail = (email) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.EMAIL_NAME}`,
      pass: `${process.env.EMAIL_PASS}`,
    },
  });
  var mailOptions = {
    from: "mhhakim65@gmail.com",
    to: `${email}`,
    subject: "Order Confirmation Email",
    text: "",
    html: `<div>        
        <h3>
          Your order go to info save in our database .you will shortly get update about your order status.
        </h3>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa autem
          deserunt suscipit numquam, fugiat officia odit dolore nulla aliquid
          neque aspernatur quibusdam ea ut eligendi magni possimus quam alias
          perspiciatis? Similique inventore praesentium, odit reprehenderit
          impedit, sunt magni, quasi totam corrupti hic iste quo? Quisquam
          dolore excepturi rerum nam, vitae possimus repellendus aut optio esse
          ea expedita, nihil quae, impedit ducimus corrupti eaque deleniti
          quibusdam voluptates recusandae facilis accusamus sequi! Cumque
          reiciendis, cupiditate culpa ratione commodi ipsum eius error minima,
          debitis, pariatur harum doloremque nemo totam numquam aut! Rerum
          laborum dolore temporibus saepe rem fuga. Reiciendis dolor sunt
          veritatis beatae.
        </p>
      </div>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
app.get("/", (req, res) => {
  res.send("Running TourBd Server.");
});

app.listen(port, () => {
  console.log(`Running port at http://localhost:${port}`);
});
