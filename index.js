const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = [] //電影總清單
let filteredMovies = [] //搜尋清單

const MOVIES_PER_PAGE = 12
let layout = 'card' // 版面預設為 card 模式
let currentPage = 1 // 版面預設為第一頁

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const layoutToggle = document.querySelector('#layout-toggle')

function renderMovieList(data) {
  let rawHTML = ''

  if (layout === 'card') {
    data.forEach((item) => {
      rawHTML += `<div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${
            POSTER_URL + item.image
          }" class="card-img-top" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button 
              class="btn btn-primary 
              btn-show-movie" 
              data-bs-toggle="modal" 
              data-bs-target="#movie-modal" 
              data-id="${item.id}"
            >
              More
            </button>
            <button 
              class="btn btn-info btn-add-favorite" 
              data-id="${item.id}"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>`
    })
  }

  if (layout === 'list') {
    data.forEach((item) => {
      rawHTML += `
      <div class="col-sm-12">
        <li class="list-group-item d-flex justify-content-between align-items-center" >
          <h6 class="list-title m-0">${item.title}</h6>
          <div>
            <button 
                class="btn btn-primary 
                btn-show-movie" 
                data-bs-toggle="modal" 
                data-bs-target="#movie-modal" 
                data-id="${item.id}"
              >
                More
              </button>
              <button 
                class="btn btn-info btn-add-favorite" 
                data-id="${item.id}"
              >
                +
              </button>
            </div>
      </li>
      </div>`
    })
  }

  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)

  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getMoviesByPage() {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (currentPage - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  // send request to show api
  axios
    .get(INDEX_URL + id)
    .then((res) => {
      const { title, release_date, description, image } = res.data.results

      // insert data into modal ui
      modalTitle.innerText = title
      modalDate.innerText = 'Release date: ' + release_date
      modalDescription.innerText = description
      modalImage.innerHTML = `<img src=${
        POSTER_URL + image
      } alt="movie-poster"  class="img-fluid"/>`
    })
    .catch((err) => console.log(err))
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// listen to data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

searchForm.addEventListener('submit', function onSearchForm(e) {
  e.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  renderPaginator(filteredMovies.length)

  currentPage = 1
  renderMovieList(getMoviesByPage())
})
// listen to paginator
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return

  currentPage = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage())
})
// listen to layoutToggle

layoutToggle.addEventListener('click', (e) => {
  if (e.target.matches('.card-mode')) {
    layout = 'card'
    renderMovieList(getMoviesByPage())
  }
  if (e.target.matches('.list-mode')) {
    layout = 'list'
    renderMovieList(getMoviesByPage())
  }
})

// send request to index api
axios
  .get(INDEX_URL)
  .then((res) => {
    movies.push(...res.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage())
  })
  .catch((err) => console.log(err))
