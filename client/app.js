const { createApp } = Vue;
const vuetify = Vuetify.createVuetify(); // Create the Vuetify instance

const app = createApp({
    data: function () {
        return {
            //all of our data
            nameInput: "",
            brandInput: "",
            barInput: "",
            imageLinkInput: "",
            tagsInput: [],
            products: []
        };
    },
    
    methods: {
        addProduct: function () {
            if (this.nameInput === "" || this.brandInput === "" || this.barInput === "" || this.imageLinkInput === "") {
                alert("Please fill in all fields");
                return;
            }
            fetch("http://localhost:8080/products", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: this.nameInput,
                    brand: this.brandInput,
                    bar: this.barInput,
                    imageLink: this.imageLinkInput,
                    tags: this.tagsInput
                })
            }).then(response => {
                this.loadProductsFromAPI();
            })
        },

        deleteProduct: function (product) {
            console.log(product);
            fetch(`http://localhost:8080/products/${product._id}`, {
                method: "DELETE",
                credentials: "include"
            }).then(response => {
                this.loadProductsFromAPI();
            });
        },

        loadProductsFromAPI: function () {
            fetch("http://localhost:8080/products", { 
                credentials: "include" 
            }).then(response => {
                response.json().then(data => {
                    this.products = data
                })
            })
        }
    },
    
    created: function () {
        console.log(this.name);
        this.loadProductsFromAPI();
    }

}).use(vuetify).mount('#app');
