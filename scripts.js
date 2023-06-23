// This file handles the user interaction with the website using data from the data.js file

// +++++ Imports +++++
// import any variables or functions
import { BOOKS_PER_PAGE, authors, genres, books} from './data.js' 

// +++++ Validation +++++
// validate our imports
if (!books && !Array.isArray(books)) throw new Error('Source required');
if (!books && books.length < 2) throw new Error('Range must be an array with two numbers') 

// +++++ Global Variables +++++
// used to declare any variables which the file might need

/** this variable holds the books which match 
 * defined criteria. Initially it holds all the books to load the page.
 */
let MATCHES = books;

/** This variable holds the 'page' we are on 
 * with a page representing 36 book previews.
 */
let PAGE = 0;

/** A variable which we use to create html elements temporarily and then
 * append the fragment once the html has been rendered.
 */
const FRAGMENT = document.createDocumentFragment();

/** This variable holds the section of books which 
 * need to be rendered or evaluated.
 */
const EXTRACTED = MATCHES.slice((PAGE*BOOKS_PER_PAGE), ((PAGE + 1)*BOOKS_PER_PAGE));

/** This variable holds our css color values which are used
 * to change the theme of the page.
 */
const CSS = {
    day:{
        dark: '10, 10, 20',
        light: '255, 255, 255',
    },
    
    night:{
        dark: '255, 255, 255',
        light: '10, 10, 20',
    },
    current:'',
};

// +++++ Functions +++++
// holds our functions

/**
 * This function creates the html element that displays the basic information of a book
 * as a button and returns that element.
 * 
 * @param {string} author - author of the book as an id string
 * @param {string} id - the id of the book as an id string
 * @param {string} image - the cover image as a link string
 * @param {string} title - the title of the book as a string
 * @returns {HTMLElement} - the button element
 */
const createPreview = ({ author, id, image, title }) => {
    const element = document.createElement('button');
    element.classList = 'preview';
    element.setAttribute('data-preview', id);

    element.innerHTML = /* html */ `
        <img
            class="preview__image"
            src="${image}"
        />
            
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;
    return element;
};

/**
 * This function passes the extracted variable to createPreview 
 * and appends the returned elements to our DOM
 * 
 * @param {Array} EXTRACTED - specific section of books we need to load
 */
const pageLoader = (EXTRACTED) => {
    for (const{author, image, title, id } of EXTRACTED) {

        const preview = createPreview({
            author,
            id,
            image,
            title
        });

        FRAGMENT.appendChild(preview);
    };

    document.querySelector('[data-list-items]').appendChild(FRAGMENT);
}

/**
 * This function populates our search dialogue with the genres.
 * 
 * @param {object} genres - the genres object from data.js
 */
const createGenreOptions = (genres) =>{
    const genreOptions = document.createDocumentFragment();
    let element = document.createElement('option');
    element.value = 'any';
    element.innerText = 'All Genres'; // this adds an option called all genres
    genreOptions.appendChild(element);

    for (const [id, name] of Object.entries(genres)) { // another for loop choice that populates the select element options
        element = document.createElement('option');
        element.value = id;
        element.innerText = name;
        genreOptions.appendChild(element);
    };

    document.querySelector('[data-search-genres]').appendChild(genreOptions); // adds all options to the select element for each genre
};

/**
 * This function populates our search dialogue with the authors.
 * 
 * @param {object} authors - the authors object from data.js
 */
const createAuthorOptions = (authors) =>{
    const authorOptions = document.createDocumentFragment() ;
    let element = document.createElement('option');
    element.value = 'any';
    element.innerText = 'All Authors';
    authorOptions.appendChild(element);

    for (const [id, name] of Object.entries(authors)) {
        element = document.createElement('option');
        element.value = id;
        element.innerText = name;
        authorOptions.appendChild(element);
    };

    document.querySelector('[data-search-authors]').appendChild(authorOptions);
};

/**
 * This function checks if the users browser or user has 
 * a specific theme and sets our website to either dark or light theme
 * 
 */
const defaultTheme = () => {
    const themeEvaluation = document.querySelector('[data-settings-theme]').value === window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').MATCHES;
    const themeValues = themeEvaluation? 'night' : 'day';

    document.documentElement.style.setProperty('--color-dark', CSS[themeValues].dark);
    document.documentElement.style.setProperty('--color-light', CSS[themeValues].light);
    CSS.current = themeValues;
};

/**
 * This function toggles the show more button and
 * populates it with the amount of books left to show
 * 
 */
const showMoreButton = () => {
    const moreButton = document.querySelector('[data-list-button]');
    const remainingMatches = MATCHES.length - ((PAGE + 1) * BOOKS_PER_PAGE);
    moreButton.disabled = remainingMatches <= 0;
    const buttonTurnery = remainingMatches > 0 ? remainingMatches : 0;

    moreButton.innerHTML = /* html */ `
        <span>Show more</span>
        <span class="list__remaining"> (${buttonTurnery})</span>
`;
};

/**
 * This function populates the page with the next 36/remaining
 * book previews
 * 
 */
const handleShowMore = () => {
    PAGE = PAGE + 1;
    const extracted = MATCHES.slice((PAGE*BOOKS_PER_PAGE), ((PAGE + 1)*BOOKS_PER_PAGE));  
    pageLoader(extracted);
    showMoreButton(); 
};

/**
 * This function toggles our description dialogue
 * and populates the description fields.
 * 
 * @param {event} `click`
 */
const handleDescriptionToggle = (event) => {
    if (document.querySelector('[data-list-active]').open) {
        document.querySelector('[data-list-active]').open = false;

    } else {
        const pathArray = Array.from(event.path || event.composedPath());
        let active = null;

        for (const node of pathArray) {
            if (active) break;
            const previewId = node?.dataset?.preview;
        
            for (const singleBook of books) {
                if (singleBook.id === previewId) active = singleBook;
            };
        };
        
        if (!active) return;
        document.querySelector('[data-list-active]').open = true;
        document.querySelector('[data-list-blur]').src = active.image;
        document.querySelector('[data-list-image]').src = active.image;
        document.querySelector('[data-list-title]').innerText = active.title;
        
        document.querySelector('[data-list-subtitle]').innerText = (authors[active.author]) +' ' + (new Date(active.published).getFullYear());
        document.querySelector('[data-list-description]').innerText = active.description;
    };
};

/**
 * This function toggles the search dialogue
 * resetting the form if the user cancels.
 * 
 */
const handleSearchToggle = () => { 

    const searchToggle = document.querySelector('[data-search-overlay]');

    if (searchToggle.open){
        searchToggle.open = false;
        document.querySelector('[data-search-form]').reset();
    } else {
        searchToggle.open = true;
        document.querySelector('[data-search-title]').focus();
    };
};

/**
 * This function handles the search submit
 * changing all our variables to match the inputs
 * and then calls other functions to print results
 * 
 * @param {event} `submit`
 */
const handleSearchSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    const result = [];

    for (const singleBook of books) {
        const titleMatch = filters.title.trim() === '' || singleBook.title.toLowerCase().includes(filters.title.toLowerCase());
        const authorMatch = filters.author === 'any' || singleBook.author === filters.author;
        
            let genreMatch = filters.genre === 'any';
            
            for (const singleGenre of singleBook.genres) {
                if (filters.genre === `any`) break;
                if (singleGenre === filters.genre) { 
                    genreMatch = true; 
                };
            };
        
        if (titleMatch && authorMatch && genreMatch) result.push(singleBook);
    };

    if (result.length < 1) {
        document.querySelector('[data-list-message]').classList.add('list__message_show');
        document.querySelector('[data-search-overlay]').open = false;
    } else {
        document.querySelector('[data-list-message]').classList.remove('list__message_show');
    };
    
    MATCHES = result;
    PAGE = 0;
    document.querySelector('[data-list-items]').innerHTML = '';
    const extracted = MATCHES.slice((PAGE*BOOKS_PER_PAGE), ((PAGE + 1)*BOOKS_PER_PAGE)); 
    pageLoader(extracted); // indicate abstraction 
    showMoreButton();

    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('[data-search-overlay]').open = false;
};

/**
 * This function toggles the theme menu.
 * 
 */
const handleThemeToggle = () => {
    const current = document.querySelector(`[data-settings-overlay]`).open;
    
    if (current) {
        document.querySelector(`[data-settings-overlay]`).open = false;
        document.querySelector('[data-settings-theme]').value = CSS.current;
    } else {
        document.querySelector(`[data-settings-overlay]`).open = true;
    };
};

/**
 * This function changes the theme of our page
 * by interacting with the <html> style
 * 
 * @param {event} `click`
 */
const handleThemeSubmit = (event) => {
    event.preventDefault();
    const userTheme = document.querySelector('[data-settings-theme]').value;

    switch (userTheme) {
        case `day`:
            document.documentElement.style.setProperty('--color-dark', CSS[userTheme].dark);
            document.documentElement.style.setProperty('--color-light', CSS[userTheme].light);
            CSS.current = userTheme;
            break;
        case `night`:
            document.documentElement.style.setProperty('--color-dark', CSS[userTheme].dark);
            document.documentElement.style.setProperty('--color-light', CSS[userTheme].light);
            CSS.current = userTheme;
            break;
        default:
            defaultTheme();
            break;
    };

    document.querySelector(`[data-settings-overlay]`).open = false;
    document.querySelector('[data-settings-theme]').value = userTheme;
};

// +++++ Main Execution +++++
// loads the default page
pageLoader(EXTRACTED);
createGenreOptions(genres);
createAuthorOptions(authors);
defaultTheme();
showMoreButton();

// +++++ Event Listeners +++++
// checks to see if the user interacts with the page
document.querySelector(`[data-list-button]`).addEventListener(`click`, handleShowMore);

document.querySelector(`[data-list-items]`).addEventListener('click', handleDescriptionToggle);
document.querySelector(`[data-list-close]`).addEventListener('click', handleDescriptionToggle);

document.querySelector(`[data-header-search]`).addEventListener(`click`, handleSearchToggle);
document.querySelector(`[data-search-cancel]`).addEventListener(`click`, handleSearchToggle);
document.querySelector(`[data-search-form]`).addEventListener(`submit`, handleSearchSubmit);

document.querySelector(`[data-header-settings]`).addEventListener('click', handleThemeToggle);
document.querySelector(`[data-settings-cancel]`).addEventListener('click', handleThemeToggle);
document.querySelector(`[data-settings-form]`).addEventListener('submit', handleThemeSubmit);