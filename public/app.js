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

            //snackbar
            showSnackbar: false,
            snackbarText: "",
            // show screen toggles
            showCreateAccount: false,
            showSignIn: false,
            showAddProduct: false,
            showEditProduct: false,
            showMainContent: true,
            showDetailedProduct: false,
            detailedProduct: null,
            showDeleteConfirm: false,
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
            tags: ["Acne", "Oily", "Dry", "Sensitive", "Combination", "Normal" ,
                 "All", "Anti-aging", "Hyperpigmentation", "Rosacea", "Erythema",
                  "Dark circles", "Brightening", "SPF", "Cleansers", "Serums", 
                  "Masks","Moisturizers", "Exfoliants", "Mists", "Eye Creams", "Chemical Peel"],
            brands: ["Eminence", "Alastin", "Skin Medica", "SkinMedica DiamondGlow", "EltaMD", "Glymed", "Hydrinity", "SkinBetter", "SkinCeuticals"]
        };
    },
    //update products when filters change
    watch: {
        tagsFilter: {
            handler() {
                this.loadProductsFromAPI();
            },
        },
        brandFilter: {
            handler() {
                this.loadProductsFromAPI();
            },
        },
        barFilter: {
            handler() {
                this.loadProductsFromAPI();
            },
        },
        // nameFilter: {
        //     handler() {
        //         this.loadProductsFromAPI();
        //     },
        // },

      },
    
    methods: {
        addProduct: function () {
            if (this.nameInput === "" || this.brandInput === "" || this.barInput === "" || this.imageLinkInput === "") {
                this.snackbar("Please fill out all fields");
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
                this.showMainContent = true;
                this.snackbar("Product successfully added!");
                } else {
                    this.snackbar("Failed to add product, product with this name already exists");
                }

            })
        },
        cancelAddProduct: function () {
            this.nameInput = "";
            this.brandInput = "";
            this.barInput = "";
            this.imageLinkInput = "";
            this.tagsInput = [];
            this.showAddProduct = false;
            this.showMainContent = true;
        },

        deleteProduct: function (product) {
            console.log(product);
            fetch(`${url}/products/${product._id}`, {
                method: "DELETE",
                credentials: "include"
            }).then(response => {
                this.loadProductsFromAPI();
                if (response.status === 200) {
                    this.showEditProduct = false;
                    this.showDetailedProduct = false;
                    this.detailedProduct = null;
                    this.showMainContent = true;
                    this.snackbar("Product successfully deleted!");
                } else {
                    this.snackbar(response.status + ": Failed to delete product");
                }
            });
        },

        editProduct: function (product) {
            if (this.detailedProduct.name === "" || this.detailedProduct.brand === "" || this.detailedProduct.bar === "" || this.detailedProduct.imageLink === "") {
                this.snackbar("Please fill out all fields");
                return;
            }
            fetch(`${url}/products/${product._id}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: this.detailedProduct.name,
                    brand: this.detailedProduct.brand,
                    bar: this.detailedProduct.bar,
                    imageLink: this.detailedProduct.imageLink,
                    tags: this.detailedProduct.tags
                })
            }).then(response => {
                this.loadProductsFromAPI();
                if (response.status === 200) {
                this.showEditProduct = false;
                this.showMainContent = true;
                this.detailedProduct = null;
                this.snackbar("Changes saved");
                } else {
                    this.snackbar(response.status + ": Failed to edit product");
                }

            })
        },
        cancelEditProduct: function () {
            this.showEditProduct = false;
            this.showMainContent = true;
            this.detailedProduct = null;
        },
        loadProductsFromAPI: function () {
            
            fetch(`${url}/products/${this.getQuery()}`, { 
                credentials: "include" 
            }).then(response => {
                response.json().then(data => {
                    this.products = data
                    if (this.products.length == 0) {
                        this.snackbar("No products found");
                    }
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
            const tagsQuery = this.tagsFilter.join(",");
            query += `tags=${encodeURIComponent(tagsQuery)}&`;
            }

            return query
        },

        clearFilters: function () {
            this.nameFilter = "";
            this.tagsFilter = [];
            this.brandFilter = null;
            this.barFilter = [];
            this.loadProductsFromAPI();
        },

        createAccount: function () {
            if (this.emailInput === "" || this.passwordInput === "" || this.firstNameInput === "" || this.lastNameInput === "") {
                this.snackbar("Please fill out all fields");
                return;
            }
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
                    this.snackbar("User already exists");
                } else {
                    this.snackbar(response.status + ": Failed to create user");
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
                    this.snackbar("User not found");
                } else if (response.status === 201) {
                    this.emailInput = "";
                    this.passwordInput = "";
                    const firstName = this.firstNameInput;
                    this.snackbar("You are now signed in! Welcome!");
                    this.firstNameInput = "";
                    this.lastNameInput = "";
                    this.showSignIn = false;
                    this.loggedIn = true;
                    this.showMainContent = true;
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
                this.showMainContent = true;
                this.showSignIn = false;
                this.showCreateAccount = false;
                this.showAddProduct = false;
                this.showEditProduct = false;
                this.showDetailedProduct = false;
                this.detailedProduct = null;
                this.snackbar("You are now signed out!");
            })
        },

        snackbar: function (message) {
            this.snackbarText = message;
            this.showSnackbar =true;
        }
    },


    created: function () {
        this.loadProductsFromAPI();
    }

}).use(vuetify).mount('#app');
