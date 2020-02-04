// require all packages
let express = require("express");
let logger = require("morgan");
let mongoose = require("mongoose");
let axios = require("axios");
let cheerio = require("cheerio");
let mongojs = require("mongojs")

// set port
let PORT = 3000;

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
mongoose.connect("mongodb://localhost/mongoScraper", { useNewUrlParser: true });

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

// Scrape data from one site and place it into the mongodb db
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
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/api/savenotes/:id", function(req, res) {

  db.Note
    .create(req.body)
    .then(function(dbNote) {
      return db.Article.insert(
        { 
          _id: mongojs.ObjectId(req.params.id) 
        }, 
        { 
          note: dbNote._id 
        }, 
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
  db.Note.find({ _id: req.params.id }, function(error, found) {
    console.log(found);
    // Log any errors
    if (error) {
      console.log(error);
    }
    else {
      // Otherwise, send json of the notes back to user
      // This will fire off the success function of the ajax request
      res.json(found);
    }
  });
});


// Listen on port 3000
app.listen(PORT, function() {
  console.log("App running on port " + PORT);
});
