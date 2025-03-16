const { createApp } = Vue;
const { createVuetify } = Vuetify;

const url = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080' 
    : 'https://skinrecs.onrender.com';
// Create the Vuetify instance with a custom theme
const vuetify = createVuetify({
    theme: {
        defaultTheme: 'roseTheme',
        themes: {
            roseTheme: {
                dark: false, 
                colors: {
                    primary: '#8F4A56',   
                    secondary: '#FDD3D0', 
                    tertiary: '#FFD5DA',
                    background: '#FFF8F7',
                    surface: '#FFFFFF',
                    error: '#D32F2F',
                    onPrimary: '#FFFFFF', 
                    onSecondary: '#5F0A0A', 
                    onBackground: '#22191A',
                    onSurface: '#22191A',
                    onSurfaceVariant: '#524345'      
                }
            }
        }
    }
});
const app = createApp({
    data: function () {
        return {
            //input rules
            rules : {
                required: value => value.length > 0 || 'Required.',
                email: value => {
                    if (/.+@.+\..+/.test(value)) return true // email validation from vue docs
                    return 'E-mail must be valid.'
                },
                password: value => {
                    if (value.length >= 8) return true
                    return 'Password must be at least 8 characters long.'
                },
            },
            //product add inputs
            nameInput: "",
            brandInput: "",
            barInput: "",
            imageLinkInput: "",
            tagsInput: [],

            products: [],
            // show screen toggles
            showCreateAccount: false,
            showSignIn: false,
            showAddProduct: false,
            showEditProduct: false,
            showMainContent: true,
            //create account inputs
            emailInput: "",
            passwordInput: "",
            firstNameInput: "",
            lastNameInput: "",
            //logged in user
            loggedIn: false,

            //filters
            nameFilter: "",
            brandFilter: "",
            barFilter: "",
            tagsFilter: [],
            // preset options for tags/brands
            tags: ["Acne", "Oily", "Dry", "Combination", "Sensitive"],
            brands: ["Eminence", "Skin Medica"]
        };
    },
    
    methods: {
        addProduct: function () {
            if (this.nameInput === "" || this.brandInput === "" || this.barInput === "" || this.imageLinkInput === "") {
                alert("Please fill in all fields");
                return;
            }
            fetch(`${url}/products`, {
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
                if (response.status === 201) {
                this.nameInput = "";
                this.brandInput = "";
                this.barInput = "";
                this.imageLinkInput = "";
                this.tagsInput = [];
                this.showAddProduct = false;
                }

            })
        },

        deleteProduct: function (product) {
            console.log(product);
            fetch(`${url}/products/${product._id}`, {
                method: "DELETE",
                credentials: "include"
            }).then(response => {
                this.loadProductsFromAPI();
            });
        },

        loadProductsFromAPI: function () {
            
            fetch(`${url}/products/${this.getQuery()}`, { 
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
            if (this.tagsFilter && this.tagsFilter.length) {
                const lowerCaseTags = this.tagsFilter.map(tag => tag.toLowerCase());
            const tagsQuery = lowerCaseTags.join(",");
            query += `tags=${encodeURIComponent(tagsQuery)}&`;
            }

            return query
        },

        createAccount: function () {
            fetch(`${url}/users`, {
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
            fetch(`${url}/session`, {
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
            fetch(`${url}/session`, {
                method: "DELETE",
                credentials: "include"
            }).then(response => {
                this.loadProductsFromAPI();
                this.loggedIn = false;
            })
        },

        clickOutsideSignIn: function () {
            this.showSignIn = false;
        },
    },


    created: function () {
        this.loadProductsFromAPI();
    }

}).use(vuetify).mount('#app');
