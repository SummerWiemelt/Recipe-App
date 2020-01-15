import axios from 'axios';

export default class Recipe {
    constructor(id) {
        this.id = id; // each recipe has a unique id 
    }

    async getRecipe() { // grabs recipe data based on id 
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title; // res = result. in console - data -> recipe -> title 
            this.author = res.data.recipe.publisher // author = publishes 
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients; //array
        } catch (error) {
            console.log(error);
            alert('Something went wrong');
        }
    }
    
    // method to create rough estimate of time to make recipe. 3 ingredients = 15 mins
    calcTime() { 
        const numImg = this.ingredients.length;
        const periods = Math.ceil(numImg / 3);
        this.time = periods * 15;
    }

    // 4 servings for each recipe 
    calcServings() {
        this.servings = 4;
    }

    // Parse Ingredients into count, unit and ingredient
    // ex: 0: {count: 4.5, unit: 'cup', ingredient: 'unbleached flour'}
    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsb', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g'] //destructuring - puts all the elements of the array into this new array 
 
        const newIngredients = this.ingredients.map(el => { //el = each element of the current array 
            // 1. Uniform units 
            let ingredient = el.toLowerCase(); //convert all to lowercase
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]); //replace unitLong with unitShort index element 
            });

            // 2. Remove parenthesis
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' '); //replace everything inside () with nothing  - regular expression 

            // 3. Parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' '); 
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2)); //creates test for each element, return index of the element, if the element is in the array (results in true)

            let objIng;
            if (unitIndex > -1) { // there is a unit

                const arrCount = arrIng.slice(0, unitIndex); 
                // Ex: 4 1/2 cups, arrCount is [4, 1/2] --> eval("4+1/2") = 4.5 
                // Ex: 5 cups, arrCount is [4]
                let count;
                if (arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+')); // for cases where the ingredients are written like 4-1/2 cups etc. 
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+')); // join the ingredients in the array (strings). eval explanation above ^ 
                }

                objIng = {
                    count, 
                    unit: arrIng[unitIndex], 
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                };

            } else if (parseInt(arrIng[0], 10)) { // there is no unit, but 1st element is a number (no number results in NaN)
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ') //entire array except 1st element. join puts them back together into a string 
                }
            } else if (unitIndex === -1) { // there is no unit and no number in 1st position
                objIng = {
                    count: 1, // if it just says a string, we will init it at 1 (ex: 1 tomato sauce)
                    unit: '', 
                    ingredient           // in ES6 = ingredient: ingredient
                }
            }

            return objIng;
        });
        this.ingredients = newIngredients;
    }

    // Update the servings size and ingredients 
    updateServings (type) {
        // Servings 
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;


        // Ingredients 
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });

        this.servings = newServings;
    }
}