// require all packages
let express = require("express");
let logger = require("morgan");
let mongoose = require("mongoose");
let axios = require("axios");
let cheerio = require("cheerio");
require('dotenv').config()
// let mongojs = require("mongojs")

// variable for deploying to heroku, or if it's being run locally
let MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoScraper";

// set port
const PORT = process.env.PORT || 3000;

// require all models
let db = require("./models");

// Initialize Express
let app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/mongoScraper", { useNewUrlParser: true });
mongoose.connect(MONGODB_URI);

// Main route 
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

// path for local javascript
app.get("/scrape.js", function(req, res) {
  res.sendFile(path.join(__dirname, "./public/scrape.js"));
});

// path for local css
app.get("/style.css", function(req, res) {
  res.sendFile(path.join(__dirname, "./public/style.css"));
});

// path for scraping
app.get("/api/scrape", function(req, res) {
  // create an object for the cheerio stories
  let storiesObject = {};
  // Make a request via axios for the news section of `ycombinator`
  axios.get("https://finance.yahoo.com/").then(function(response) {
    // Load the html body from axios into cheerio
    let $ = cheerio.load(response.data);
    // For each element with a "h3" class
    $(".js-stream-content").each(function(i, element) {
      // grab the relevant elements
      storiesObject.title = $(element).find("h3").text().trim();
      storiesObject.link = $(element).find("a").attr("href");
      storiesObject.body = $(element).find("p").text().trim();
        // if the article has all the relevant items...
        if (storiesObject.title && storiesObject.link && storiesObject.body) {
        // ...save them to the database
        db.Article.create(storiesObject)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });

        }
      });
    // send array back to client
    res.json(storiesObject);
  });

});

// Route for grabbing a specific Article by id, update status to "saved"
app.post("/api/save/:id", function(req, res) {
  db.Article
    .update({ _id: req.params.id }, { $set: {saved: true}})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, update status to "false"
app.post("/api/delete/:id", function(req, res) {
  db.Article
    .update(
      { _id: req.params.id }, 
      { $set: {saved: false}
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// route for pulling up all saved articles
app.get("/api/getsaved/", function(req, res) {
  // only get ones whose saved status is true
  db.Article
    .find({saved: true})
    // .populate('note') // TODO
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for getting all Articles from the db
app.get("/api/articles", function(req, res) {
  
  db.Article
    .find({saved: false})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {

  db.Article
    .findOne({ _id: req.params.id })
    .populate("notes")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/api/savenotes/", function(req, res) {
  // set some variables to hold the stuff we ant
  const note = req.body.newNote;
  const id = req.body.articleId;
  // create the note...
  db.Note.create({note})
    // ... then return the note with the new mongoose Id
    .then(function(dbNote) {
      // If a Note was created successfully, find the right Article and push the new Note's _id to the Article's `notes` array
      // { new: true } tells the query that we want it to return the updated Article -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate(
        {_id: mongoose.Types.ObjectId(id)}, 
        { $push: { note: dbNote._id } }, 
        { new: true }
      );
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Retrieve appropriate notes from mongo
app.get("/api/notes/:id", function(req, res) {
  // Find all notes in the notes collection
  db.Article.find({ _id: req.params.id })
  .populate("note")
  .then(function(data) {
    console.log(data);
    // If able to successfully find and associate all Users and Notes, send them back to the client
    res.json(data);
  })
  .catch(function(err) {
    // If an error occurs, send it back to the client
    res.json(err);
  });
});

app.delete("/notes/delete/:id", function(req, res) {
  // Use the note id to find and delete it
  db.Note.findOneAndRemove({ "_id": req.params.id }, function(err) {
    // Log any errors
    if (err) {
      console.log(err);
      res.send(err);
    }
  }).catch(function(err) {
    res.json(err);
  });
});

// Listen on port 3000
app.listen(PORT, function() {
  console.log("App running on port " + PORT);
});
