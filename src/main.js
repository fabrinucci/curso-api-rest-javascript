const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3/',
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
  params: {
    'api_key': API_KEY,
  },
});

function likedMovieList() {

  const item = JSON.parse(localStorage.getItem('liked_movies'));

  let list;

  if( item ) {
    return list = item;
  } else {
    return list = {}
  }
}

function likeMovie(movie) {
  const likedMovie = likedMovieList();
  
  if( likedMovie[movie.id] ) {
    likedMovie[movie.id] = undefined;
  } else {
    likedMovie[movie.id] = movie;
  }
  
  localStorage.setItem('liked_movies', JSON.stringify(likedMovie))

  // To add the movie to favorite without reload.

  if (location.hash == ''){
    homePage();
  }

}


// Utils

const lazyObserver = new IntersectionObserver((entries) => {
  entries.forEach( entry => {
    if( entry.isIntersecting ) {
      const url = entry.target.getAttribute('data-img');
      entry.target.setAttribute('src', url)
    }
  })
})

function createMovies(movies, container, { 
  isObserve = false,
  cleanHTML = true 
} = {}) {
  if( cleanHTML ) {
    container.innerHTML = '';
  }

  movies.forEach(movie => {
    const movieContainer = document.createElement('div');
    movieContainer.classList.add('movie-container');

    const movieImg = document.createElement('img');
    movieImg.classList.add('movie-img');
    movieImg.setAttribute('alt', movie.title);

    movieImg.setAttribute(
      (isObserve ? 'data-img' : 'src'),
      (`https://image.tmdb.org/t/p/w300/${movie.poster_path}`)
    );

    movieImg.addEventListener('click', () => {
      location.hash = '#movie=' + movie.id;
    });
    
    movieImg.addEventListener('error', () => {
      movieImg.setAttribute(
        'src', 
        'https://www.quicideportes.com/assets/images/custom/no-image.png'
      );
    });
    

    const movieBtn = document.createElement('button');
    movieBtn.classList.add('movie-btn');
    likedMovieList()[movie.id] && movieBtn.classList.add('movie-btn--liked');
    movieBtn.addEventListener('click', () => {
      movieBtn.classList.toggle('movie-btn--liked')
      likeMovie(movie);
    })

    if( isObserve ) {
      lazyObserver.observe(movieImg);
    }

    movieContainer.append(movieImg, movieBtn);
    container.appendChild(movieContainer);
  });
}

function createCategories(categories, container) {
  container.innerHTML = "";

  categories.forEach(category => {  
    const categoryContainer = document.createElement('div');
    categoryContainer.classList.add('category-container');

    const categoryTitle = document.createElement('h3');
    categoryTitle.classList.add('category-title');
    categoryTitle.setAttribute('id', 'id' + category.id);
    categoryTitle.addEventListener('click', () => {
      location.hash = `#category=${category.id}-${category.name}`;
    });
    const categoryTitleText = document.createTextNode(category.name);

    categoryTitle.appendChild(categoryTitleText);
    categoryContainer.appendChild(categoryTitle);
    container.appendChild(categoryContainer);
  });
}

// Llamados a la API

async function getTrendingMoviesPreview() {
  const { data } = await api('trending/movie/day');
  const movies = data.results;

  createMovies(movies, trendingMoviesPreviewList, {
    isObserve: true
  });
}

async function getCategegoriesPreview() {
  const { data } = await api('genre/movie/list');
  const categories = data.genres;

  createCategories(categories, categoriesPreviewList)  ;
}

async function getMoviesByCategory(id) {
  const { data } = await api('discover/movie', {
    params: {
      with_genres: id,
    },
  });
  const movies = data.results;

  maxPage = data.total_pages

  createMovies(movies, genericSection, {
    isObserve: true
  });
}

function getPaginatedMoviesByCategory(id) {

  return async function() {
    const { scrollTop, clientHeight, scrollHeight} = document.documentElement;
    const isScrollBottom = (scrollTop + clientHeight) === scrollHeight;
    const isNotMaxPage = page < maxPage;
  
    if( isScrollBottom && isNotMaxPage ) {
      page++
      const { data } = await api('discover/movie', {
        params: {
          with_genres: id,
          page
        }
      });
      const movies = data.results;
  
      createMovies(
        movies, 
        genericSection, {
          isObserve: true,
          cleanHTML: false
        }
      );
    }
  }
}

async function getMoviesBySearch(query) {
  const { data } = await api('search/movie', {
    params: {
      query,
    },
  });
  const movies = data.results;

  maxPage = data.total_pages

  createMovies(movies, genericSection, {
    isObserve: true
  });
}

function getPaginatedMoviesBySearch(query) {

  return async function() {
    const { scrollTop, clientHeight, scrollHeight} = document.documentElement;
    const isScrollBottom = (scrollTop + clientHeight) === scrollHeight;
    const isNotMaxPage = page < maxPage;
  
    if( isScrollBottom && isNotMaxPage ) {
      page++
      const { data } = await api('search/movie', {
        params: {
          query,
          page
        }
      });
      const movies = data.results;
  
      createMovies(
        movies, 
        genericSection, {
          isObserve: true,
          cleanHTML: false
        }
      );
    }
  }
}

async function getTrendingMovies() {
  const { data } = await api('trending/movie/day');
  const movies = data.results;

  maxPage = data.total_pages

  createMovies(
    movies,
    genericSection, {
      isObserve: true,
      cleanHTML: true  
    }
  );
  
}

async function getPaginatedTrendingMovies() {

  const { scrollTop, clientHeight, scrollHeight} = document.documentElement;
  const isScrollBottom = (scrollTop + clientHeight) === scrollHeight;
  const isNotMaxPage = page < maxPage;

  if( isScrollBottom && isNotMaxPage ) {
    page++
    const { data } = await api('trending/movie/day', {
      params: {
        page
      }
    });
    const movies = data.results;

    createMovies(
      movies, 
      genericSection, {
        isObserve: true,
        cleanHTML: false
      }
    );
  }

}

async function getMovieById(id) {
  const { data: movie } = await api('movie/' + id);

  const movieImgUrl = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
  console.log(movieImgUrl)
  headerSection.style.background = `
    linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.35) 19.27%,
      rgba(0, 0, 0, 0) 29.17%
    ),
    url(${movieImgUrl})
  `;
  
  movieDetailTitle.textContent = movie.title;
  movieDetailDescription.textContent = movie.overview;
  movieDetailScore.textContent = movie.vote_average;

  createCategories(movie.genres, movieDetailCategoriesList);

  getRelatedMoviesId(id);
}

async function getRelatedMoviesId(id) {
  const { data } = await api(`movie/${id}/recommendations`);
  const relatedMovies = data.results;

  createMovies(relatedMovies, relatedMoviesContainer);
}

function getLikedMovies() {
  const likedMovies = likedMovieList();
  const moviesArr = Object.values(likedMovies);

  createMovies(
    moviesArr,
    likedMovieListArticle, {
      isObserve: true,
      cleanHTML: true
    }
  )
}