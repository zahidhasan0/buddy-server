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
      const users = await usersCollections.find({}).toArray();
      let isUser = false;

      users.forEach((currentUser) => {
        if (currentUser.email === user?.email) {
          isUser = true;
        }
      });

      if (!isUser) {
        const result = await usersCollections.insertOne(user);
        res.send(result);
      } else {
        console.log("user exist");
        res.send({ result: "user exist" });
      }
    });

    app.get("/users", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollections.findOne(query);
      console.log(user);
      res.send(user);
    });

    app.get("/homePosts", async (req, res) => {
      const query = {};

      const posts = await postsCollections.find(query).toArray();

      posts.sort((a, b) =>
        a.reactUsers.length < b.reactUsers.length ? 1 : -1
      );
      res.send(posts);
    });

    app.post("/posts", async (req, res) => {
      const post = req.body;
      const result = await postsCollections.insertOne(post);
      res.send(result);
    });

    app.get("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const post = await postsCollections.findOne(query);
      res.send(post);
    });

    app.put("/react/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const userEmail = req.body.userId;
      const options = { upsert: true };

      const post = await postsCollections.findOne(query);

      const usersThatReacted = post.reactUsers;

      if (!usersThatReacted?.includes(userEmail)) {
        const updatedDoc = {
          $set: {
            reactUsers: [...usersThatReacted, userEmail],
          },
        };
        const result = await postsCollections.updateOne(
          query,
          updatedDoc,
          options
        );

        res.send({ result: "added" });
      } else {
        removedUserArr = usersThatReacted.filter((e) => e !== userEmail);

        const updatedDoc = {
          $set: {
            reactUsers: [...removedUserArr],
          },
        };
        const result = await postsCollections.updateOne(
          query,
          updatedDoc,
          options
        );

        res.send({ result: "removed" });
      }
    });

    app.put("/users", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const body = req.body;

      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          name: body.name,
          profilePic: body.profilePic,
          university: body.university,
          address: body.address,
        },
      };
      const result = await usersCollections.updateOne(
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

    app.delete("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await postsCollections.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch((error) => console.error(error));

app.get("/", (req, res) => {
  res.send("This is the server of buddy");
});
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
