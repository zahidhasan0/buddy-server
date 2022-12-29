const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.klzscqy.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const usersCollections = client.db("buddy").collection("users");
    const postsCollections = client.db("buddy").collection("posts");

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollections.insertOne(user);
      res.send(result);
      console.log(result);
    });

    app.get("/users", async (req, res) => {
      const email = req.query;
      console.log(email);
      const query = { email };
      const user = await usersCollections.findOne(query);
      res.send(user);
      console.log(user);
    });

    app.get("/homePosts", async (req, res) => {
      const query = {};
      const posts = await postsCollections
        .find(query)
        .limit(3)
        .sort({ react: 1 })
        .toArray();
      res.send(posts);
      console.log(posts);
    });

    app.post("/posts", async (req, res) => {
      const post = req.body;
      const result = await postsCollections.insertOne(post);
      res.send(result);
      console.log(result);
    });

    app.get("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const post = await postsCollections.findOne(query);
      res.send(post);
      console.log(post);
    });

    app.put("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const numberOfReact = req.body.reactCount;
      console.log(numberOfReact);
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          react: numberOfReact,
          text: req.body.text,
          image: req.body.image,
        },
      };
      const result = await postsCollections.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
      console.log(result);
    });

    app.get("/posts", async (req, res) => {
      const query = {};
      const posts = await postsCollections.find(query).toArray();
      res.send(posts);
    });

    app.get("/", (req, res) => {
      res.send("This is the server of buddy");
    });
  } finally {
  }
}
run().catch((error) => console.error(error));

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
