const { createApp } = Vue;
const vuetify = Vuetify.createVuetify(); // Create the Vuetify instance

createApp({
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
            fetch("http://localhost:8080/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    
                })
            }).then(response => {
                this.loadProductsFromAPI();
            })
        },

        deleteProduct: function (product) {
            console.log(product);
            fetch(`http://localhost:8080/products/${product._id}`, {
                method: "DELETE"
            }).then(response => {
                this.loadProductsFromAPI();
            });
        },

        loadProductsFromAPI: function () {
            fetch("http://localhost:8080/products")
            .then(response => {
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
