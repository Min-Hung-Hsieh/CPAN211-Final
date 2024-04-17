const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");

// funcion register
router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  try {
    console.log("Received registration data:", req.body);

    const userExists = await User.findOne({ username: req.body.username });
    if (userExists) {
      return res.redirect("/register?error=User already exists");
    }

    // If user does not exist, proceed with registration
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
    });

    await user.save();
    console.log("User registered successfully");
    res.redirect("/register?success=Registration successful");
  } catch (error) {
    console.error("Registration error:", error);
    res.redirect("/register");
  }
});

// Login function
router.get("/login", (req, res) => {
  res.render("login");
});

// Handle login
router.post("/login", async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.redirect("/login?error=User does not exist");
    }

    // If user exists, compare the hashed passwords
    if (await bcrypt.compare(req.body.password, user.password)) {
      console.log("Logged in successfully");
      req.session.username = user.username;
      res.redirect("/login?success=Login successful");
    } else {
      res.redirect("/login?error=Invalid password");
    }
  } catch (error) {
    console.error("Login error:", error);
    res.redirect("/login");
  }
});

// Function profile
router.get("/profile", async (req, res) => {
  if (!req.session.username) {
    res.redirect("/login");
  } else {
    try {
      const userData = await User.findOne({ username: req.session.username });
      if (!userData) {
        return res.redirect("/");
      }
      res.render("profile", {
        user: userData,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.redirect("/");
    }
  }
});

// update profile
router.post("/update-profile", async (req, res) => {
  if (!req.session.username) {
    return res.redirect("/login");
  }
  try {
    await User.updateOne(
      { username: req.session.username },
      {
        $set: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          city: req.body.city,
          phone: req.body.phone,
        },
      }
    );
    res.redirect("/profile?success=Profile updated successfully");
  } catch (error) {
    console.error("Error updating profile:", error);
    res.redirect("/profile?error=Error updating profile");
  }
});

// Handle profile
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;
