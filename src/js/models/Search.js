import axios from 'axios';

export default class Search {
    constructor(query) {
        this.query = query;
    }

    async getResults() { //all async promises return a promise 
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/search?&q=${this.query}`); //result of the promise saves to res
            this.result = res.data.recipes;
        } catch(error) {
            alert(error);
        }
    }
}

 



