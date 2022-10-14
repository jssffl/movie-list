const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const movies = [];
let filterdMovies = [];
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const MOVIES_PER_PAGE = 12;

function renderMovieList(data) {
  let rawHTML = "";

  data.forEach((item) => {
    const { image, title, id } = item;

    rawHTML += `<div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img
                src=${POSTER_URL + image}
                class="card-img-top"
                alt="Movie Poster"
              />
              <div class="card-body">
                <h5 class="card-title">${title}</h5>
              </div>
              <div class="card-footer">
                <button
                  class="btn btn-primary btn-show-movie"
                  data-bs-toggle="modal"
                  data-bs-target="#movie-modal"
                  data-id=${id}
                >
                  More
                </button>
                <button class="btn btn-info btn-add-favorite" data-id=${id}>+</button>
              </div>
            </div>
          </div>
        </div>
        `;
  });
  dataPanel.innerHTML = rawHTML;
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);

  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

function getMoviesByPage(page) {
  const data = filterdMovies.length ? filterdMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  // send request to show api
  axios
    .get(INDEX_URL + id)
    .then((res) => {
      const { title, release_date, description, image } = res.data.results;

      // insert data into modal ui
      modalTitle.innerText = title;
      modalDate.innerText = "Release date: " + release_date;
      modalDescription.innerText = description;
      modalImage.innerHTML = `<img src=${
        POSTER_URL + image
      } alt="movie-poster"  class="img-fluid"/>`;
    })
    .catch((err) => console.log(err));
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);
  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中");
  }
  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

// listen to data panel
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(event.target.dataset.id);
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

searchForm.addEventListener("submit", function onSearchForm(e) {
  e.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  filterdMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  if (filterdMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
  }

  renderPaginator(filterdMovies.length);
  renderMovieList(getMoviesByPage(1));
});

paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;

  const page = Number(event.target.dataset.page);
  renderMovieList(getMoviesByPage(page));
});

axios
  .get(INDEX_URL)
  .then((res) => {
    movies.push(...res.data.results);
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(1));
  })
  .catch((err) => console.log(err));
