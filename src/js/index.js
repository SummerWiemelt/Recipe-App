import Search from './models/Search'; 
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';    // object in which all the searchView will be stored 
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';



/** Global state for the app 
* - Search object
* - Current recipe object
* - Shopping list object
* - Liked recipes 
*/
const state = {};

/*****************  SEARCH CONTROLLER ******************/

const controlSearch = async () => {
    // 1. Get query from view 
    const query = searchView.getInput(); // read input from the input field 

    if (query) {
        // 2. New search object and add to state
        state.search = new Search(query); //stored in global state object 

        // 3. Prepare UI for results 
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes); // renders loader 

        try {
            // 4. Search for recipes 
            await state.search.getResults(); //returns a promise (from Search.js) - only after this is done, do we move on to step 5.

            // 5. Render results on UI 
            clearLoader(); //clears loader 
            searchView.renderResults(state.search.result); //result is stored in state. 
        } catch (err) {
            alert('Something wrong with the search');
            learLoader(); //clears loader
        }
    }    
}

elements.searchForm.addEventListener('submit', e => { // search button with event argument (e)
    e.preventDefault(); //prevents the page from automatically reloading on search click
    controlSearch();
});


elements.searchResPages.addEventListener('click', e => { // e is our click event 
    const btn = e.target.closest('.btn-inline'); //closest method traverses parents of the element until it finds a matching node. Allows us to click anywhere on the button while only targeting the Button node  
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10); // shows us the matching data set attribute for the button click (ex: clicking page 1 = 1). 10 = specifies base 
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage); //renders results, pass in the page we are going to 
    }
});



/****************  RECIPE CONTROLLER  *****************/

const controlRecipe = async () => {
    // Get ID from url
    const id = window.location.hash.replace('#', ''); // each recipe click gives us the hash id. We remove the # 

    if (id) {
        // Prepare UI for changes 
        recipeView.clearRecipe();
        renderLoader(elements.recipe); //need to pass in parent so the loader knows where to display itself 

        // Highlight selected search item 
        if (state.search) searchView.highlightSelected(id);
        

        // Create new recipe object 
        state.recipe = new Recipe(id);


        try {
            // Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // Call calcTime and calcServings 
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Render recipe 
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id) //is it liked or not
                );

        } catch (err) {
            console.log(err);
            alert('Error processing recipe');
        }
    }    
};

//window.addEventListener('hashchange', controlRecipe); // window = global object for the browser // hashchange - change hash id when controlRecipe is called 
//window.addEventListener('load', controlRecipe); // happens on load too - not just when the hash changes 

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe)); // equivilant to the lines above ^ 



/********************  LIST CONTROLLER *********************/

const controlList = () => {
    // Create new list IF there is none yet 
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI 
    state.recipe.ingredients.forEach(el => { //loops through ingredients and then adds them to the shopping list by each element (el)
        const item = state.list.addItem(el.count, el.unit, el.ingredient); // from List.js
        listView.renderItem(item);
    });
}

// Handle, delete and update list item events 
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid; // closest click to the ".shopping__item" class and reads id 

    // Handle delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);
        // Delete from UI
        listView.deleteItem(id); 

        // Handle the count update 
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10); //e.target = element that was clicked - can now read value of it 
        state.list.updateCount(id, val);
    }
});

/****************** LIKE CONTROLLER *************************/



const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // User has NOT yet liked current recipe 
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state 
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title, 
            state.recipe.author,
            state.recipe.img
        );

        // Toggle the like button 
        likesView.togglelikeBtn(true);

        // Add like to the UI list 
        likesView.renderLike(newLike);
        

    // User has liked current recipe 
    } else {
        // Remove like to the state 
        state.likes.deleteLike(currentID);

        // Toggle the like button 
        likesView.togglelikeBtn(false);

        // Remove like to the UI list 
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
 
};

// Restore liked recipes on page load 
window.addEventListener('load', () => {
    state.likes = new Likes();

    // Restore likes 
    state.likes.readStorage(); 

    // Toggle like menu button 
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes 
    state.likes.likes.forEach(like => likesView.renderLike(like));
});


// Handling recipe button clicks 
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) { //if the target matches the classname or any child (*)
        // Decrease button is clicked 
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) { //if the target matches the classname or any child (*)
       // Increase button is clicked 
       state.recipe.updateServings('inc');
       recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) { //add recipe to shopping list button (or any child)
        // Add ingredients to shopping list 
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller 
        controlLike();
    }
});

