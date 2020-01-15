import { elements } from './base';



// Gets input value 
export const getInput = () => elements.searchInput.value; //get value. only one line is an implicit return - automatically returns 


// Clears the search bar after search
export const clearInput = () => { 
    elements.searchInput.value = '';
};


// Clears the last search results from the UI
export const clearResults = () => { 
    elements.searchResList.innerHTML = ''; 
    elements.searchResPages.innerHTML = '';
};

// Keep selected recipe highlighted grey
export const highlightSelected = id => {
    // removes last selected recipe- so only one stays highlighted 
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));
    resultsArr.forEach(el => {
        el.classList.remove('results__link--active');
    });

    document.querySelector(`.results__link[href="#${id}"]`).classList.add('results__link--active');
};

// Limit of accepted maximum characters length
export const limitRecipeTitle = (title, limit = 17) => { 
    const newTitle = [];
    if (title.length > limit) {
        title.split(' ').reduce((acc, cur) => {  //split - puts each word into an array //reduce takes in accumulator, and current 
            if (acc + cur.length <= limit) {
                newTitle.push(cur);
            }
            return acc + cur.length;
        }, 0); //inits accumulator at 0 

        // return the results
        return `${newTitle.join(' ')} ...`; // join method - joins elements into a string seperated by spaces 
    }
    return title;
} 
    /* Example: ^ 
        'Pasta with tomato and spinach '
        acc: 0 / acc + cur.lenth = 5 / newTittle = ['Pasta']
        acc: 5 / acc + cur.lenth = 9 / newTittle = ['Pasta', 'with']
        acc: 6 / acc + cur.lenth = 15 / newTittle = ['Pasta', 'with', 'tomato']
        acc: 3 / acc + cur.lenth = 18 / newTittle = ['Pasta', 'with', 'tomato'] // more than limit- not pushed 
    */ 


// Render recipes on UI 
const renderRecipe = recipe => { // don't need to export (if want to delete line limit feature- get rid of limitRecipeTitle()- keep only ${recipe.title})
    const markup = `
        <li>
        <a class="results__link" href="#${recipe.recipe_id}">
            <figure class="results__fig">
                <img src="${recipe.image_url}" alt="${recipe.title}">
            </figure>
            <div class="results__data">
                <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>  
                <p class="results__author">${recipe.title}</p>
            </div>
        </a>
    </li>
    `;
    elements.searchResList.insertAdjacentHTML('beforeend', markup); //takes a position (beforeend- just inside the element, after its last child), and the text. New elements will go to the end of the list 
};

// Create the button for the pagination (type: 'prev' or 'next')
const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
        <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
            <svg class="search__icon">
                <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
            </svg>
    </button>
`; 



// Render buttons for pagination 
const renderButtons = (page, numResults, resPerPage) => { 
    const pages = Math.ceil(numResults / resPerPage); // calculates which page we're on. ceil mathod rounds up the integer 

    let button;
    if (page === 1 && pages > 1) { // ensures there are more pages left 
        // Only button to go to next page  
        button = createButton(page, 'next');
    } else if (page < pages ) {
        // Both buttons 
        button = `
            ${createButton(page, 'prev')}
            ${createButton(page, 'next')}
        `;
    } else if (page === pages && pages > 1) { // = last page 
        // Only button to go to prev page 
        button = createButton(page, 'prev');
    }

    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};


// Render recipe results on page 
export const renderResults = (recipes, page = 1, resPerPage = 10) => { //recieves array of 30 recipes, loops through each one and calls the renderRecipe function for each 
    // render results of current page 
    const start = (page - 1) * resPerPage; 
    const end = page * resPerPage;

    recipes.slice(start, end).forEach(renderRecipe);  //slice returns a portion of an array into a new array - to display only 10 results per page
    
    // render pagination buttons 
    renderButtons(page, recipes.length, resPerPage);
};