const express = require("express"),
  port = process.env.PORT || 3001,
  bodyParser = require("body-parser"),
  cors = require("cors"),
  mongoose = require("mongoose"),
  ObjectId = mongoose.Types.ObjectId,
  { euclidean } = require('ml-distance-euclidean');

mongoose.connect('mongodb://localhost:27017/face_server').
  catch(error => handleError(error));

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const Student = require("./models/student.js");

app.post("/register_student", async (req, res) => {
  let body = req.body;
  let response = await new Student({
    first_name: body.first_name,
    last_name: body.last_name,
    email: body.email,
    password: body.password,
    embeddings: body.embeddings.latent_features,
    lecture_access: false,
    lab_access: false,
    library_access: false
  })
    .save()
    .catch((err) => {
      console.log(err);
      return err;
    });
  res.send(response);
});

app.get("/students", async (req, res) => {
  let response = await Student.find();
  res.send(response);
});

app.post("/student_compare_distances", async (req, res) => {
  let found = await Student.findOne({ "_id": ObjectId(req.body._id) })
    .select("embeddings");
  let input_embeddings = found.embeddings;
  let all = await (await Student.find())
    .map((e) => {
      let temp = {...e._doc};
      temp['distance'] = euclidean(input_embeddings, e['embeddings']);
      delete temp.embeddings;
      return temp;
    });
  res.send(all);
});

app.post("/nearest_student", async (req, res) => {
  let input_embeddings = req.body.input_embeddings;
  console.log(input_embeddings);
  let all = await (await Student.find().select("first_name last_name email embeddings"))
    .map((e) => {
      let temp = {...e._doc};
      temp.distance = euclidean(input_embeddings, e.embeddings);
      delete temp.embeddings;
      return temp;
    })
    .filter((e)=>e.distance < 0.4)[0];
  res.send(all);
});

app.post("/change_access", async (req, res) => {
  let _id = ObjectId(req.body._id);
  let which = req.body.which;
  let value = req.body.value;
  let found = await Student.findOne({ "_id": _id });
  if (which == 0) {
    await Student.findOneAndUpdate({ "_id": _id }, { "lecture_access": !found.lecture_access });
  } else if (which == 1) {
    await Student.findOneAndUpdate({ "_id": _id }, { "lab_access": !found.lab_access });
  } else {
    await Student.findOneAndUpdate({ "_id": _id }, { "library_access": !found.library_access });
  }
  res.send("OK!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
