const express = require("express");
const mongoose = require("mongoose");
const cookieSession = require('cookie-session');
const User = require("./User");

const app = express();

//Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/projects', { useNewUrlParser: true, useUnifiedTopology: true });

//Project Schema
const projectSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  name: {
    type: String,
    required: [true, "is required"]
  },
  description: String,
  creationDate: Date
});

//ProjectModel
const Project = mongoose.model("Project", projectSchema);

//Middlewares
app.use(express.static("public"));
app.use(express.json());

app.use(cookieSession({
  secret: "my secret",

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const requireUser = (req, res, next) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not Authenticated" });
    return;
  }

  next();
}

//GET projects
app.get("/projects", requireUser, async (req, res, next) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

//POST projects
app.post("/projects", requireUser, async (req, res, next) => {
  const newProject = { name: req.body.name, description: req.body.description };
  newProject.creationDate = new Date();
  console.log("User Id: ", req.session.userId);
  newProject.user = req.session.userId;

  try {
    const project = await Project.create(newProject)
    res.json(project);
  } catch (err) {
    next(err);
  }
});

app.post("/register", async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.create({ email, password });
    req.session.userId = user._id;
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.post("/login", async (req, res, next) => {

  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email });

    if (user && user.password === password) {
      req.session.userId = user._id;
      res.json({ ok: true });
    } else {
      res.status(401).json({ error: "Invalid credentials "});
    }
  } catch (err) {
    next(err);
  }
});

// Manejo de errores
app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    res.status(422).json({ errors: err.errors });
  } else {
    // error inesperado
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
