$(document).ready(function() {

// universal variable to hold our returned data
let data = [];
// if there are no articles display a message
if (data.length === 0) {
    $(".articles").append("Click the scrape button to grab some stories");
};

// click function for scraping
$(document).on("click", ".scrape-button", function (e) {
    e.preventDefault(e);
    // empty the div
    $(".articles").empty();
    // call the scrape function
    scrapeArticles();
});

// click function for clearing articles
$(document).on("click", ".clear-button", function (e) {
    $(".articles").empty().append("Click the scrape button to grab some stories");
});

// click function for showing notes
$(document).on("click", ".get-notes", function (e) {
    $(".modal-title").empty();
    $(".modal-footer").empty();
    $(".note").empty();
    $(".results").empty();
    let articleId;
    $(".modal").modal("show");
    // grab the articleId from the "show notes" button
    articleId = $(this).attr("data-id");
    // add id to title of modal
    $(".modal-title").append("Note for article " + articleId);
    // create save button with bootstrap classes and local class
    let saveBtn = $("<button class='btn btn-success save-note'>Save Note</button>");
    // add the articleId to the data attribute
    saveBtn.attr("data-id", articleId);
    // append the note button to the modal
    $(".modal-footer").append(saveBtn);
    showNotes(articleId);
});

//Click function to save note
$(document).on("click", ".save-note", saveNote);  

//Click function to save article
$(document).on("click", ".save-article", saveArticle);

//Click function to get saved articles
$(document).on("click", ".saved-button", getSavedArticles);

//Click function to delete saved article
$(document).on("click", ".delete-article", deleteSavedArticle);

// function for scraping articles
function scrapeArticles() {
    // scrape route saves articles to database
    $.get("/api/scrape").then(function(data) {
        // call the function that then grabs the saved articles
        loadDatabase();
    });

}; // end scrapeArtices function

// function for loading non-saved articles
function loadDatabase() {
    // Run an AJAX request for any unsaved headlines
    $.get("/api/articles?saved=false").then(function(data) {
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
        //append title and saveBtn to header
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
      // If there are articles render them to the page
      if (data && data.length) {
        // call the render function
        renderSavedArticles(data);
      } else {
        // Otherwise render a message explaining we have no saved articles
        $(".articles").empty().append("You have no saved articles");
      }
    });
  };

// function for rendering saved articles
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
    // append to articles div
    $(".articles").append(card);

    }
}

// function for saving an article
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

function deleteSavedArticle() {
    // set a variable for the article Id
    let articleId = $(this).attr("data-id");
    // Remove card from page
    $(this).parents(".card").remove();
    // Update an existing record in the db
    $.ajax({
        method: "POST",
        url: "/api/delete/"+articleId,
        data: articleId
        }).then(function(data) {
        // If the data was saved successfully
        if (data.saved) {
            console.log("saved")
        }
        if (!data || data.length === 0) {
        $(".articles").empty().append("Click the scrape button to grab some stories");

        }
    });
};

// This function handles opening the notes modal and displaying our notes
function showNotes(articleId) {
    // Grab any notes with this headline/article id
    $.get("/api/notes/" + articleId).then(function(data) {
        // set an empty array to hold notes we want to display
        let notesToRender = [];
        // create a current note variable
        let currentNote;
        // check to see if there are any notes
        if (data[0].note.length === 0) {
            // if not display a 'no notes' message
            currentNote = $("<li class='list-group-item notes-list'>No notes for this article yet.</li>");
            notesToRender.push(currentNote);
        } else {
            // If we do have notes, go through each one
            for (var i = 0; i < data[0].note.length; i++) {
            // Constructs an li element to contain our noteText and a delete button
            let deleteNoteBtn = ($("<button class='btn btn-danger delete-note'>x</button>"));
            // add note id to the delete button
            deleteNoteBtn.attr("data-note", data[0].note[i]._id)
            // create the current note
            currentNote = $("<li class='list-group-item note'>")
                .text(data[0].note[i].note)
                .append(deleteNoteBtn);
            // Adding our currentNote to the notesToRender array
            notesToRender.push(currentNote);
            };
        };
        // append the notesToRender to the note-container inside the note modal
        $(".results").append(notesToRender);  

        // click to delete a note
        $(".delete-note").on("click", function() {
            var noteId = $(this).attr("data-note");
  
            $.ajax({
                method: "DELETE",
                url: "/notes/delete/" + noteId
            }).done(function(data) {
                console.log(data)
                $(".modal").modal("hide");
                // window.location = "/saved"
            })
        });
    });
};

  // Function for creating and saving notes
function saveNote() {
    // setting a variable for the article Id
    let articleId = $(this).attr("data-id");
    // variable for the entered note
    let newNote = $("textarea").val().trim();
    // if we have a note
    if (newNote) {
        // send it to the servere
        $.ajax({
            method: "POST",
            url: "/api/savenotes/",
            data: {
                newNote, 
                articleId
            } 
            }).then(function(data) {
                // If the data was saved successfully
                if (data.saved) {
                console.log("saved")
                };
                // When complete, clear the divs and close the modal
                $(".note").empty();
                // hide the modal
                $(".modal").modal("hide");
            });
        };
    };
});