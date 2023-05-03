import './sass/index.scss';
import { Notify } from 'notiflix';
import { fetchImages } from './pixabay-api.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  input: document.querySelector('input[name="searchQuery"]'),
  submitBtn: document.querySelector('button[type="submit"]'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

let currentPage = 1;
let totalHits = 0;
let hitsCounter = 0;

refs.submitBtn.addEventListener('click', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

function createCards(images) {
  hitsCounter += images.hits.length;
  const proprieties = images.hits.map(
    ({
      webformatURL,
      tags,
      largeImageURL,
      likes,
      views,
      comments,
      downloads,
    }) => {
      return `<div class="photo-card">
        <a href="${largeImageURL}">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item">
            <b>Likes</b>
            ${likes}
          </p>
          <p class="info-item">
            <b>Views</b>
            ${views}
          </p>
          <p class="info-item">
            <b>Comments</b>
            ${comments}
          </p>
          <p class="info-item">
            <b>Downloads</b>
            ${downloads}
          </p>
        </div>
      </div>`;
    }
  );
  refs.gallery.insertAdjacentHTML('beforeend', proprieties.join(''));
  const lightbox = new SimpleLightbox('.gallery a');
  lightbox.refresh();
}

async function onSearch(e) {
  e.preventDefault();
  refs.gallery.innerHTML = '';
  refs.loadMoreBtn.classList.add('is-hidden');
  currentPage = 1;
  try {
    const searchQuery = refs.input.value.trim();
    if (searchQuery === '') {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    const images = await fetchImages(searchQuery, currentPage);
    if (images.hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    createCards(images);
    refs.loadMoreBtn.classList.remove('is-hidden');
    Notify.success(`Hooray! We found ${images.totalHits} images.`);
    totalHits = images.totalHits;
    currentPage += 1;
  } catch (error) {
    console.log(error);
  }
}

async function onLoadMore() {
  try {
    const searchQuery = refs.input.value.trim();
    const images = await fetchImages(searchQuery, currentPage);
    if (totalHits <= hitsCounter) {
      refs.loadMoreBtn.classList.add('is-hidden');
      Notify.info("We're sorry, but you've reached the end of search results.");
      hitsCounter = 0;
      return;
    }
    createCards(images);
    currentPage += 1;
    window.scrollTo({
      top: document.documentElement.offsetHeight,
      behavior: 'smooth',
    });
  } catch (error) {
    console.log(error);
  }
  lightbox.refresh();
}
