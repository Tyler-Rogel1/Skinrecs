const { createApp } = Vue;
const { createVuetify } = Vuetify;

// Create the Vuetify instance with a custom theme
const vuetify = createVuetify({
    icons: {
        defaultSet: 'mdi',  // Use MDI icons
    },
    theme: {
        defaultTheme: 'roseTheme',
        themes: {
            roseTheme: {
                dark: false, 
                colors: {
                    primary: '#8F4A56',   
                    secondary: '#FDD3D0', 
                    tertiary: '#F57C00',  
                    background: '#FFF8F7',
                    surface: '#FFFFFF',
                    error: '#D32F2F',
                    onPrimary: '#FFFFFF', 
                    onSecondary: '#5F0A0A', 
                    onBackground: '#1C1B1F',
                    onSurface: '#1C1B1F'      
                }
            }
        }
    }
});
const app = createApp({
    data: function () {
        return {
            //product add inputs
            nameInput: "",
            brandInput: "",
            barInput: "",
            imageLinkInput: "",
            tagsInput: [],

            products: [],
            // show input toggles
            showCreateAccount: false,
            showSignIn: false,
            showAddProduct: false,
            showEditProduct: false,
            //create account inputs
            emailInput: "",
            passwordInput: "",
            firstNameInput: "",
            lastNameInput: "",
            //logged in user
            loggedIn: false,
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
            
            fetch(`http://localhost:8080/products/`, { 
                credentials: "include" 
            }).then(response => {
                response.json().then(data => {
                    this.products = data
                })
            })
        },

        getQuery: function () {
            let query = '?';
            if (this.nameFilter) {
                query += `name=${encodeURIComponent(this.nameFilter)}&`;
            }
            if (this.brandFilter) {
                query += `brand=${encodeURIComponent(this.brandFilter)}&`;
            }
            if (this.barFilter) {
                query += `bar=${encodeURIComponent(this.barFilter)}&`;
            }
            if (this.tagsFilter) {
                query += `tags=${encodeURIComponent(this.tagsFilter)}&`;
            }

            return query
        },

        createAccount: function () {
            fetch("http://localhost:8080/users", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: this.emailInput,
                    plainPassword: this.passwordInput,
                    firstName: this.firstNameInput,
                    lastName: this.lastNameInput
                })
            }).then(response => {
                this.loadProductsFromAPI();
                if (response.status === 201) {
                    this.showCreateAccount = false;
                    this.signIn();
                } else if (response.status === 422) {
                    alert("User with this email already exists");
                    //actually send a useful error
                } else {
                    alert("Something went wrong");
                    //some 500 error occurred
                }
            })
        },

        signIn: function () {
            fetch("http://localhost:8080/session", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: this.emailInput,
                    plainPassword: this.passwordInput
                })
            }).then(response => {
                this.loadProductsFromAPI();
                if (response.status === 401) {
                    alert("User not found");
                    //actually send a useful error
                } else if (response.status === 201) {
                    this.emailInput = "";
                    this.passwordInput = "";
                    this.firstNameInput = "";
                    this.lastNameInput = "";
                    this.showSignIn = false;
                    this.loggedIn = true;
                }
            })
        },
        logOut: function () {
            fetch("http://localhost:8080/session", {
                method: "DELETE",
                credentials: "include"
            }).then(response => {
                this.loadProductsFromAPI();
                this.loggedIn = false;
            })
        }
    },


    created: function () {
        this.loadProductsFromAPI();
    }

}).use(vuetify).mount('#app');
