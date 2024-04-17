const express = require("express");
const router = express.Router();
const Job = require("../models/job");

router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find({});
    res.render("jobs", { jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Add new job
router.get("/add", (req, res) => {
  res.render("add-job");
});

// Post a new job
router.post("/add", async (req, res) => {
  try {
    const newJob = new Job({
      title: req.body.title,
      description: req.body.description,
      salary: req.body.salary,
      location: req.body.location,
      company: req.body.company,
      description: req.body.description,
    });
    await newJob.save();
    console.log("Job added successfully");
    res.redirect("/job");
  } catch (error) {
    console.error("Error adding new job:", error);
    res.redirect("/job/add");
  }
});

// Edit job form
router.get("/edit/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).send("Job not found");
    }
    res.render("edit-job", { job });
  } catch (error) {
    console.error("Error fetching job details:", error);
    res.redirect("/job");
  }
});

// Update job details
router.post("/edit/:id", async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        salary: req.body.salary,
        location: req.body.location,
        company: req.body.company,
      },
      { new: true }
    );
    console.log("Job updated successfully");
    res.redirect("/job");
  } catch (error) {
    console.error("Error updating job:", error);
    res.redirect(`/job/edit/${req.params.id}`);
  }
});

// Delete a job
router.get("/delete/:id", async (req, res) => {
  try {
    await Job.findByIdAndRemove(req.params.id);
    console.log("Job deleted successfully");
    res.redirect("/job");
  } catch (error) {
    console.error("Error deleting job:", error);
    res.redirect("/job");
  }
});

module.exports = router;
