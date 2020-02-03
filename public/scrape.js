$(document).ready(function() {

// universal variable to hold our returned data
let data = [];
// if there are no articles display a message
if (data.length === 0) {
    $(".articles").append("Click the scrape button to grab some stories");
}

// click for scraping
$(document).on("click", ".scrape-button", function (e) {
    e.preventDefault(e);
    // empty the div
    $(".articles").empty();
    // call the scrape function
    scrapeArticles();
});

// click for clearing articles
$(document).on("click", ".clear-button", function (e) {
    $(".articles").empty().append("Click the scrape button to grab some stories");
});

//Click to save article
$(document).on("click", ".save-article", saveArticle);

//Click to get saved articles
$(document).on("click", ".saved-button", getSavedArticles);

// function for scraping articles
function scrapeArticles() {
    // scrape route saves articles to database
    $.get("/api/scrape").then(function(data) {
        // call the function that then grabs the saved articles
        loadDatabase();
    });

}; // end scrapeArtices function

function loadDatabase() {
    // Run an AJAX request for any unsaved headlines
    $.get("/api/articles?saved=false").then(function(data) {

        savedArticles = data;

        console.log(data);
        // debugger;
    //   $(".articles").empty();
      // If we have headlines, render them to the page
      if (data && data.length) {
        renderArticles(data);
      } else {
        // Otherwise render a message explaining we have no saved articles
        $(".articles").empty().append("You have no saved stories");
      }
    });
  }

function renderArticles(data) {
    // loop through the data
    for (i = 0; i < data.length; i ++){
        // create the card
        let card = $("<div class='card'>");
        // add the article's id to the data-id attribute
        card.attr("data-id", data[i]._id);
        // create header
        let header = $("<div class='card-header col-lg-12'>");
        // create article title
        let title = $("<div class='col-lg-10'><h5><a href='https://finance.yahoo.com" + data[i].link + "'>"+data[i].title+"</a></h5>");
        // create the save button
        let saveBtn = $("<div class='col-lg-2'><button>");
        // add text to save button
        saveBtn.text("Save article");
        // add classes
        saveBtn.addClass("btn btn-danger save-article");
        // add article id
        saveBtn.attr("data-id", data[i]._id);
        header.append(title, saveBtn);
        // create body variable
        let body = $("<div class='card-text'>").text(data[i].body);
        // append header & body to card
        card.append(header, body);
        // append card to articles div
        $(".articles").append(card);

    }
};

// get saved articles function
function getSavedArticles() {
    // Run an AJAX request for any unsaved headlines
    $.get("/api/getsaved").then(function(data) {
    // empty the array
    savedArticles = [];
    // set the array to the returned data
    savedArticles = data;
      // If there are articles render them to the page
      if (data && data.length) {
        // call the render function
        renderSavedArticles(data);
      } else {
        // Otherwise render a message explaining we have no saved articles
        $(".articles").empty().append("You have no saved articles");
      }
    });
  }

function renderSavedArticles(data) {
    // empty the container
    $(".articles").empty();
    // loop through th data
    for (let i = 0; i < data.length; i++) {
    // create the card to be inserted
    let card = $("<div class='card'>");
    // add the db article id to the data attribute
    card.attr("data-id", data[i]._id);
    // create the header
    let header = $("<div class='card-header col-lg-12'>");
    // create the title
    let title = $("<div class='col-lg-10'><h5><a href='https://finance.yahoo.com" + data[i].link + "'>"+data[i].title+"</a></h5>");
    // create the delete button with attributes
    let deleteBtn = $("<div class='col-lg-1'><button>");
    deleteBtn.text("Delete");
    deleteBtn.addClass("btn btn-danger delete-article");
    deleteBtn.attr("data-id", data[i]._id);
    // create the notes button with attributes
    let notesBtn = $("<div class='col-lg-1'><button>");
    notesBtn.text("Notes");
    notesBtn.addClass("btn btn-success get-notes");
    notesBtn.attr("data-id", data[i]._id);
    // append it all to the header
    header.append(title, deleteBtn, notesBtn);
    // create body
    let body = $("<div class='card-text'>").text(data[i].body);
    // append header & body to card
    card.append(header, body);


    $(".articles").append(card);

    }
}

function saveArticle() {
    // set a variable for the article Id
    let articleId = $(this).attr("data-id");
    // Remove card from page
    $(this).parents(".card").remove();
    // Update an existing record in the db
    $.ajax({
      method: "POST",
      url: "/api/save/"+articleId,
      data: articleId
    }).then(function(data) {
      // If the data was saved successfully
      if (data.saved) {
        console.log("saved")
      }
    });
  }

});