

export default class Likes {
    constructor() {
        this.likes = [];
    }

    addLike(id, title, author, img) {
        const like = { id, title, author, img };
        this.likes.push(like); // push to the likes array 

        // Persist data in localStorage 
        this.persistData();

        return like;
    }

    deleteLike(id) {
        const index = this.likes.findIndex(el => el.id === id);  // pass in id, find index of id, remove element corresponding to that id in the likes array
        this.likes.splice(index, 1);

        // Persist data in localStorage 
        this.persistData();
    }

    // to test if we have a like in our array likes 
    isLiked(id) {
        return this.likes.findIndex(el => el.id === id) !== -1;
    }

    getNumLikes() {
        return this.likes.length;
    }

    persistData() {
        localStorage.setItem('likes', JSON.stringify(this.likes)); //JSON transformes from array into a string 
    }

    readStorage() {
        const storage = JSON.parse(localStorage.getItem('likes')); // converts back to original data structure - in this case an array. If we never like anything- returns NULL

        // Restore likes from the localStorage
        if (storage) this.likes = storage; // if not NULL 
    } 
}

