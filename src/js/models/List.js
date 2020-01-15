import uniqid from 'uniqid';

export default class List {
    constructor () {
        this.items = [];
    }

    addItem(count, unit, ingredient) {
        const item = {
            id: uniqid(), // creates a unique id for each item
            count, 
            unit, 
            ingredient
        }
        this.items.push(item); // push to array
        return item;
    }

    deleteItem (id) {
        const index = this.items.findIndex(el => el.id === id); // finds the index of the element 
        // [2, 4, 8] splice(1, 1); (1 = index, 1 = how many elements to remove) returns 4 - mutating the original array to [2, 8] (slice is similar - but slice doesn't mutate the original array) 
        this.items.splice(index, 1);
    }

    // Update amount of ingredients in shopping list 
    updateCount(id, newCount) {
        this.items.find(el => el.id === id).count = newCount;
    }
}