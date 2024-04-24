/**
 * These variables holds the data for the end movie preference POST request content,
 * and also aid in the process of making the site more interactive.
 */
var movies_liked = new Set();
var movies_disliked = new Set();
var movies_watched = new Set();
var watchlist = new Set();
var movies_rewatch = new Set();
var movies_blocked = new Set();

let isLoading = false; // Prevents multiple movie fetches at once
const movieContainer = document.getElementById("movie_container");
const searchbar = document.getElementById("searchbar");
const tooltipBackgroundColor = "#9a8aff"; // Original tooltip button color
var currentTooltiptext = null; // Holds the last tooltip that was clicked on

loadUserMovies();
fetchMovies(50);

/*Function from landing_page/js/index.js */
async function getCSRFToken() {
  try {
    const response = await fetch("/get-csrf-token/");
    const data = await response.json();
    const csrfToken = data.csrf_token;

    return csrfToken;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    throw error; // Rethrow the error to propagate it
  }
}
function printStatus() {
  console.log("Movies Liked: ", movies_liked);
  console.log("Movies Disliked: ", movies_disliked);
  console.log("Movies Watched: ", movies_watched);
  console.log("Watchlist: ", watchlist);
  console.log("Movies Rewatch: ", movies_rewatch);
  console.log("Movies Blocked: ", movies_blocked);
}

/**
 * This class is used to create the div that holds a movie object.
 * Note that buttons aren't stylized with user preferences until they
 * are clicked on.
 * @param {Movie} movie the movie object to populate
 * @returns
 */
function createMovieDiv(movie) {
  var movieDiv = document.createElement("div");
  movieDiv.classList.add("movie", "tooltip");
  movieDiv.onclick = function () {
    revealDetails(movie.id);
  };
  // Add tooltip content
  var tooltiptext = document.createElement("div");
  tooltiptext.classList.add("tooltiptext");
  tooltiptext.id = movie.id;
  tooltiptext.innerHTML = `
  <h3>${movie.name}</h3>
  <p>${movie.year}</p>
  <p class ="tooltip_message hidden" id ="${movie.id}_tooltip_message"></p>
  <div class="tooltip_buttons">
    <div class="row1">
      <i class="fa-regular fa-2x fa-thumbs-up tooltip_button" id="${movie.id}_upvote" onclick="addLiked('${movie.id}')"></i>
      <i class="fa-regular fa-2x fa-thumbs-down tooltip_button" id="${movie.id}_dislike"onclick="addDisliked('${movie.id}')"></i>
    </div>
    <div class="row2">
      <i class="fa-regular fa-2x fa-eye tooltip_button" id="${movie.id}_seen" onclick="addSeen('${movie.id}')"></i>
      <i class="fa-solid fa-2x fa-plus tooltip_button" id = "${movie.id}_watchlist" onclick="addWatchlist('${movie.id}')"></i>
    </div>
    <div class="row3">
      <i class="fa-solid fa-2x fa-repeat tooltip_button" id = "${movie.id}_rewatch" onclick ="addRewatch('${movie.id}')"></i>
      <i class="fa-solid fa-2x fa-ban tooltip_button" id = "${movie.id}_exclude" onclick="addToExclude('${movie.id}')"></i>
    </div>
  </div>`;
  movieDiv.appendChild(tooltiptext);
  // Add poster
  var poster = document.createElement("img");
  poster.src = "https://image.tmdb.org/t/p/w300" + movie.poster;
  poster.loading = "lazy";

  movieDiv.appendChild(poster);
  return movieDiv;
}

/**
 * This function reveals the tooltip along with adding the right styling
 * for the tooltip buttons.
 * @param {*} movie_id
 */
function revealDetails(movie_id) {
  if (currentTooltiptext) {
    currentTooltiptext.style.display = "none";
  }
  var tooltip = document.getElementById(movie_id);
  // Add styling to the buttons
  if (movies_liked.has(movie_id)) {
    document.getElementById(movie_id + "_upvote").style.backgroundColor =
      "green";
  }
  if (movies_disliked.has(movie_id)) {
    document.getElementById(movie_id + "_dislike").style.backgroundColor =
      "red";
  }
  if (movies_watched.has(movie_id)) {
    document.getElementById(movie_id + "_seen").style.backgroundColor = "blue";
  }
  if (watchlist.has(movie_id)) {
    document.getElementById(movie_id + "_watchlist").style.backgroundColor =
      "cornflowerblue";
  }
  if (movies_rewatch.has(movie_id)) {
    document.getElementById(movie_id + "_rewatch").style.backgroundColor =
      "orange";
  }
  if (movies_blocked.has(movie_id)) {
    document.getElementById(movie_id + "_exclude").style.backgroundColor =
      "red";
  }
  currentTooltiptext = tooltip;
  currentTooltiptext.style.display = "block";
}

/**
 *
 * Movie-db related functions
 *
 */

/* Repurposed code from landing_page/js/index.js */
async function searchMovies(event) {
  if (event.key != "Enter") {
    return;
  }
  searchString = searchbar.value.trim();

  // Search movie if there is any string to be searched
  if (searchString) {
    const csrfToken = await getCSRFToken();
    fetch("/api/search/movies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ search: searchString, send_all: true }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        movieContainer.innerHTML = "";
        // Iterate through results, adding them to the movie container
        data.movies.forEach((movie) => {
          console.log("Movie: ", movie);
          // First make the movie div
          var movieDiv = createMovieDiv(movie);
          movieContainer.appendChild(movieDiv);
        });
      });
  } else {
    // If the search bar is empty, clear the movie container and get random movies
    movieContainer.innerHTML = ""; //TODO create new div to add response message ("Getting random movies...")
    fetchMovies(50);
  }
}

/**
 * Fetches random movies from the database and adds them to the movie container.
 * @param {int} numMovies
 * @returns
 */
async function fetchMovies(numMovies = 35) {
  // Prevent multiple fetches at once
  if (isLoading) return;
  isLoading = true;

  try {
    // Fetch movies from the API
    const response = await fetch(`/api/movies/?amount=${numMovies}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    // Load JSON
    const data = await response.json();
    data.movies.forEach((movie) => {
      var movieDiv = createMovieDiv(movie);
      movieContainer.appendChild(movieDiv);
    });
  } catch (error) {
    console.error("Error fetching movies:", error);
  } finally {
    isLoading = false;
  }
}

/**
 * This function is called when the user clicks the submit button on the onboarding page,
 * if the response is successful, the user is redirected to the triggers page.
 */
async function submitOnboardingMovieForm() {
  const csrfToken = await getCSRFToken();
  const data = {
    movies_liked: Array.from(movies_liked),
    movies_disliked: Array.from(movies_disliked),
    movies_watched: Array.from(movies_watched),
    watchlist: Array.from(watchlist),
    movies_rewatch: Array.from(movies_rewatch),
    movies_blocked: Array.from(movies_blocked),
  };

  fetch("/accounts/onboarding/movies/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      window.location.href = "/accounts/onboarding/triggers/";
    })
    .catch((error) => {
      console.error("Error submitting movie preferences:", error);
    });
}

/************************************
 *
 *  Page initialization
 *
 ************************************/
/**
 * This function is called when the page loads, it populates the user data
 * sets so that the page may be styled accordingly based on current user preferences.
 */
async function loadUserMovies() {
  const csrfToken = await getCSRFToken();
  fetch("/accounts/preferences/movies", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return response.json();
    })
    .then((data) => {
      movies_liked = new Set(data.movies_liked);
      movies_disliked = new Set(data.movies_disliked);
      movies_watched = new Set(data.movies_watched);
      watchlist = new Set(data.watchlist);
      movies_rewatch = new Set(data.movies_rewatch);
      movies_blocked = new Set(data.movies_blocked);
    });
}

// Random movie fetch when scrolling past halfway point
document.addEventListener("DOMContentLoaded", function () {
  movieContainer.addEventListener("scroll", () => {
    searchString = searchbar.value.trim();
    threshold = movieContainer.scrollHeight - movieContainer.clientHeight / 2;
    if (!searchString && movieContainer.scrollTop >= threshold) {
      fetchMovies();
    }
  });
});

// Hides the tooltip when the user clicks outside of it
document.addEventListener("click", function (event) {
  if (currentTooltiptext && !currentTooltiptext.contains(event.target)) {
    console.log("Hiding tooltip - click event listener!");
    currentTooltiptext.style.display = "none";
  }
});

/************************************
 *
 * User preference button functions
 *
 ************************************/

/**
 * This function attempts to update the liked status of a movie.
 * @param {String} id the id of the movie to be updated
 */
function addLiked(id) {
  liked_button = document.getElementById(id + "_upvote");

  if (movies_liked.has(id)) {
    // Unliking a movie
    liked_button.style.backgroundColor = tooltipBackgroundColor;
    movies_liked.delete(id);

    return;
  } else if (movies_disliked.has(id)) {
    // Disliked -> Like
    disliked_button = document.getElementById(id + "_dislike");
    disliked_button.style.backgroundColor = tooltipBackgroundColor;
    movies_disliked.delete(id);
  } else {
    // Newly watched movie
    watched_button = document.getElementById(id + "_seen");
    watched_button.style.backgroundColor = "blue";
    movies_watched.add(id);
  }

  // Style like button
  movies_liked.add(id);
  liked_button.style.backgroundColor = "green";
}

/**
 * This function attempts to update the dislike status of a movie.
 * @param {String} id the id of the movie to be updated
 */
function addDisliked(id) {
  dislike_button = document.getElementById(id + "_dislike");

  if (movies_disliked.has(id)) {
    // Remove from dislikes
    dislike_button.style.backgroundColor = tooltipBackgroundColor;
    movies_disliked.delete(id);

    return;
  } else if (movies_liked.has(id)) {
    // Like -> Dislike
    liked_button = document.getElementById(id + "_upvote");
    liked_button.style.backgroundColor = tooltipBackgroundColor;
    movies_liked.delete(id);
  } else {
    // Newly watched movie
    watched_button = document.getElementById(id + "_seen");
    watched_button.style.backgroundColor = "blue";
    movies_watched.add(id);
  }
  // Style dislike button
  movies_disliked.add(id);
  dislike_button.style.backgroundColor = "red";
}

/**
 * This function attempts to update the watched status of a movie.
 * @param {String} id the id of the movie to be updated
 */
function addSeen(id) {
  seen_button = document.getElementById(id + "_seen");

  if (movies_watched.has(id)) {
    // First, check to see that the user has not liked/disliked the movie, as
    // rating a movie implies that it has been watched.
    if (movies_liked.has(id) || movies_disliked.has(id)) {
      tooltip_message = document.getElementById(id + "_tooltip_message");
      tooltip_message.classList.remove("hidden");
      tooltip_message.innerHTML =
        "Please remove your rating before marking a movie as un-watched.";
      return;
    }

    if (movies_rewatch.has(id)) {
      // Remove movie from rewatch
      rewatch_button = document.getElementById(id + "_rewatch");
      rewatch_button.style.backgroundColor = tooltipBackgroundColor;
      movies_rewatch.delete(id);
    }

    // Remove movie from seen
    seen_button.style.backgroundColor = tooltipBackgroundColor;
    movies_watched.delete(id);
    return;
  }

  if (watchlist.has(id)) {
    // Remove movie from watchlist
    watchlist_button = document.getElementById(id + "_watchlist");
    watchlist_button.style.backgroundColor = tooltipBackgroundColor;
    watchlist.delete(id);
  }

  // Add movie to seen
  seen_button.style.backgroundColor = "blue";
  movies_watched.add(id);
}

/**
 * This function attempts to add a movie to the users watchlist.
 * @param {String} id the id of the movie to be updated
 */
function addWatchlist(id) {
  watchlist_button = document.getElementById(id + "_watchlist");

  // Ensure the user has not already watched the movie
  if (movies_watched.has(id)) {
    tooltip_message = document.getElementById(id + "_tooltip_message");
    tooltip_message.classList.remove("hidden");
    tooltip_message.innerHTML =
      "You cannot add a movie you have seen to your watchlist, did you mean to select the rewatch button?";
    return;
  }

  // Ensure the user has not blocked the movie
  if (movies_blocked.has(id)) {
    tooltip_message = document.getElementById(id + "_tooltip_message");
    tooltip_message.innerHTML =
      "You cannot add a movie you have excluded from recommendations to your watchlist.";
    tooltip_message.classList.remove("hidden");
    return;
  }

  if (watchlist.has(id)) {
    // Remove movie from watchlist
    watchlist_button.style.backgroundColor = tooltipBackgroundColor;
    watchlist.delete(id);
    return;
  }

  // Add movie to watchlist
  watchlist_button.style.backgroundColor = "cornflowerblue";
  watchlist.add(id);
}

/**
 * This function attempts to update the rewatch status of a movie.
 * @param {String} id the id of the movie to be updated
 */
function addRewatch(id) {
  rewatch_button = document.getElementById(id + "_rewatch");

  // Ensure the user has watched the movie before adding it to rewatch
  if (!movies_watched.has(id)) {
    tooltip_message = document.getElementById(id + "_tooltip_message");
    tooltip_message.innerHTML = "You cannot rewatch a movie you have not seen.";
    tooltip_message.classList.remove("hidden");
    return;
  }

  // Ensure the user has not blocked the movie
  if (movies_blocked.has(id)) {
    tooltip_message = document.getElementById(id + "_tooltip_message");
    tooltip_message.innerHTML =
      "You cannot rewatch a movie you have excluded from recommendations.";
    tooltip_message.classList.remove("hidden");
    return;
  }

  if (movies_rewatch.has(id)) {
    // Remove movie from rewatch
    rewatch_button.style.backgroundColor = tooltipBackgroundColor;
    movies_rewatch.delete(id);
    return;
  }

  // Add movie to rewatch
  rewatch_button.style.backgroundColor = "orange";
  movies_rewatch.add(id);
}

/**
 * This function attempts to update the block status of a movie.
 * @param {String} id the id of the movie to be updated
 */
function addToExclude(id) {
  exclude_button = document.getElementById(id + "_exclude");

  if (movies_blocked.has(id)) {
    // Remove movie from exclude list
    exclude_button.style.backgroundColor = tooltipBackgroundColor;
    movies_blocked.delete(id);
    return;
  }

  if (watchlist.has(id)) {
    // Remove movie from watchlist
    watchlist_button = document.getElementById(id + "_watchlist");
    watchlist_button.style.backgroundColor = tooltipBackgroundColor;
    watchlist.delete(id);
  } else if (movies_watched.has(id)) {
    // Remove movie from rewatch list
    rewatch_button = document.getElementById(id + "_rewatch");
    rewatch_button.style.backgroundColor = tooltipBackgroundColor;
    movies_rewatch.delete(id);
  }

  // Add movie to exclude
  exclude_button.style.backgroundColor = "red";
  movies_blocked.add(id);
}
