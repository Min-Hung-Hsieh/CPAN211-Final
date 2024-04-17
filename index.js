const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const User = require("./models/user");

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// Connect to database
mongoose
  .connect("mongodb://127.0.0.1:27017/CPAN212", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

const db = mongoose.connection;

db.on("error", function (err) {
  console.error("MongoDB connection error:", err);
});

const app = express();

// Configure session middleware
app.use(
  session({
    secret: "1234",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Import Job Mongoose schema
const Job = require("./models/job");

// Set view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Import job routes
const jobRoutes = require("./routes/jobs");
app.use("/job", jobRoutes);

// Import auth routes
const authRoutes = require("./routes/auth");
app.use("/", authRoutes);

//  search job
app.get("/search", (req, res) => {
  const searchQuery = req.query.keyword || "";
  const regex = new RegExp(escapeRegex(searchQuery), "i");

  Job.find({ title: regex }, (err, jobs) => {
    if (err) {
      console.error("Error searching for jobs:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.render("joblist", { jobs: jobs });
  });
});

// Handle index page
app.use("/", function (req, res) {
  Job.find({}, function (err, jobs) {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
    res.render("index", { session: req.session, jobs: jobs });
  });
});

app.get("/", (req, res) => {
  Job.find({}, function (err, jobs) {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
    res.render("index", { session: req.session, jobs: jobs });
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
