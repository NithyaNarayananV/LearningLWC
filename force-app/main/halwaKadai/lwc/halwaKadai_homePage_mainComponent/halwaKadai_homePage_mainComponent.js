// file: halwaKadai_homePage_mainComponent.js
import { LightningElement, wire } from 'lwc';
import getCurrentUser from '@salesforce/apex/Halwakadai_HelperClass.getCurrentUser';
import initializeData from '@salesforce/apex/HalwaKadai_DataInitializer.initializeData';
import { getState, setState, setSummary, setSiteUser, getSummary, subscribe as stateSubscribe, getProductsCONSTANT } from 'c/halwaKadaiUtils';

const KEYhalwaProducts = 'halwaKadai:halwaProducts';
const KEYsummary = 'halwaKadai:summary';
const KEYsiteUser = 'halwaKadai:siteUser';

const CLASSNAME = 'halwaKadai_homePage_mainComponent';
const HOMEPAGE = 'halwaKadaiHomePage';
const ABOUTPAGE = 'halwaKadaiAboutPage';
const PRODUCTSPAGE = 'halwaKadaiProductsPage';
const CARTPAGE = 'halwaKadaiCartPage';
const CHECKOUTPAGE = 'halwaKadaiCheckoutPage';
const ORDERCONFIRMATIONPAGE = 'halwaKadaiOrderConfirmationPage';
const LOGINPAGE = 'halwaKadaiLogin';  
const CONTACTPAGE = 'halwaKadaiContactPage';

export default class HalwaKadai_homePage_mainComponent extends LightningElement {
    
    // UI Visibility Flags - ALL must be declared for LWC reactivity
    isActive_Home = true;
    isActive_About = false;
    isActive_Product = false;
    isActive_Contact = false;
    isActive_Cart = false;             // FIX: Added missing declaration
    isActive_Login = false;            // FIX: Added missing declaration
    isActive_CheckOut = false;
    isActive_OrderConfirmation = false; // FIX: Corrected spelling from OderConfimation

    // CSS Classes
    homeClass = 'slds-show';
    cartClass = 'slds-hide';
    productClass = 'slds-hide';
    checkoutClass = 'slds-hide';
    orderConfirmationClass = 'slds-hide';
    loginClass = 'slds-hide';

    // State Variables
    halwaProducts = null;
    productCount = 0;
    summary = { totalCount: 0, totalPrice: 0, loggedIn: false };
    isAdmin = false;
    unsub;

    // Navigation helpers to reduce duplication
    setSectionVisibility(section) {
        // FIX: Added Cart and Login to the reset chain so they don't stay permanently active
        this.isActive_Home = this.isActive_About = this.isActive_Product = this.isActive_Contact = this.isActive_OrderConfirmation = this.isActive_CheckOut = this.isActive_Cart = this.isActive_Login = false;
        // reset classes
        this.homeClass = this.cartClass = this.productClass = this.checkoutClass = this.orderConfirmationClass = this.loginClass = 'slds-hide';
        
        switch (section) {
            case 'Home': this.isActive_Home = true; this.homeClass = 'slds-show'; break;
            case 'About': this.isActive_About = true; break; 
            case 'Products': this.isActive_Product = true; this.productClass = 'slds-show'; break;
            case 'Contact': this.isActive_Contact = true; break;
            case 'Cart': this.isActive_Cart = true; this.cartClass = 'slds-show'; break;
            case 'Checkout': this.isActive_CheckOut = true; this.checkoutClass = 'slds-show'; break;
            case 'OrderConfirmation': this.isActive_OrderConfirmation = true; this.orderConfirmationClass = 'slds-show'; break;
            case 'Login': this.isActive_Login = true; this.loginClass = 'slds-show'; break;
            default: break;
        }
        this.handleScrollTop();
    }

    navigateTo(pageConst, uiSectionLabel, nextConst) {
        this.setSectionVisibility(uiSectionLabel);
        this.updateDocumentTitle(uiSectionLabel);
        const prev = (this.summary && this.summary.currentPage) ? this.summary.currentPage : HOMEPAGE;
        const newSummary = {
            ...this.summary,
            previousPage: prev,
            currentPage: pageConst,
            nextPage: nextConst || pageConst
        };
        setSummary(newSummary);
        this.summary = newSummary; // ensure local sync immediately
    }
  
    @wire(getCurrentUser)
    userDetails(result) {
        if (result.data) {
            this.isAdmin = result.data.Profile.Name === 'System Administrator';
        } else if (result.error) {
            console.error('Error in getCurrentUser: ', result.error);
        }
    }

    connectedCallback() {
        const rawhalwaProducts = window.localStorage.getItem(KEYhalwaProducts);
        const rawsummary = window.localStorage.getItem(KEYsummary);

        if (rawhalwaProducts) {
            try {
                this.halwaProducts = JSON.parse(rawhalwaProducts);
                setState(this.halwaProducts);
            } catch (e) {
                window.localStorage.removeItem(KEYhalwaProducts);
                console.error('Error parsing localStorage products:', e);
            }
        } else {
            this.halwaProducts = getState();
        }

        if (rawsummary) {
            try {
                this.summary = JSON.parse(rawsummary);
                setSummary(this.summary);
            } catch (e) {
                window.localStorage.removeItem(KEYsummary);
                console.error('Error parsing localStorage summary:', e);
            }
        } else {
            this.summary = getSummary();
        }

        // Subscribe to future changes
        this.unsub = stateSubscribe((data) => {
            this.halwaProducts = data.products;
            this.summary = data.summary;
        // State subscription for reactive updates
        });
    }
  
    disconnectedCallback() {
        if (this.unsub) {
            this.unsub();
        }
    }

    updateDocumentTitle(currentPage = 'Home') {
    document.title = currentPage+' - Halwa Kadai';
    }

  onHomeClick(){
    this.navigateTo(HOMEPAGE, 'Home', this.summary && this.summary.loggedIn ? PRODUCTSPAGE : LOGINPAGE);
    }
  onAboutClick(){
    this.navigateTo(ABOUTPAGE, 'About', this.summary && this.summary.loggedIn ? PRODUCTSPAGE : LOGINPAGE);
    } 
  onProductsClick(){
    this.navigateTo(PRODUCTSPAGE, 'Products', this.summary && this.summary.loggedIn ? CARTPAGE : LOGINPAGE);
    }
  onContactClick(){
    this.navigateTo(CONTACTPAGE, 'Contact', this.summary && this.summary.loggedIn ? PRODUCTSPAGE : LOGINPAGE);
    } 
  onCartClick(){
    const next = (this.summary && this.summary.loggedIn) ? CHECKOUTPAGE : LOGINPAGE;
    this.navigateTo(CARTPAGE, 'Cart', next);
    } 
  onCheckoutClick(){
    // If not logged in, force Login first, then Checkout
    if (this.summary && this.summary.loggedIn === false) {
            setSummary({
                ...this.summary,
                previousPage: CARTPAGE,
                currentPage: LOGINPAGE,
                nextPage: CHECKOUTPAGE
            });
            this.onLoginClick();
            return;
        }
    // Logged-in users go directly to Checkout
        this.navigateTo(CHECKOUTPAGE, 'Checkout', ORDERCONFIRMATIONPAGE);
    }
  onLoginClick(){
    // Preserve intent to go to Checkout if coming from Cart, else default to Products
    const nextAfterLogin = (this.summary && this.summary.previousPage === CARTPAGE) ? CHECKOUTPAGE : PRODUCTSPAGE;
        this.navigateTo(LOGINPAGE, 'Login', nextAfterLogin);
    }
  onLogOutClick(){
    this.hideAll();
    setState(getProductsCONSTANT());
    setSummary({ totalCount: 0, totalPrice: 0 , loggedIn: false, orderPlaced: false, orderId: null, newUser: true});
    window.localStorage.removeItem(KEYsummary);
    window.localStorage.removeItem(KEYsiteUser);
        
    this.summary = { ...this.summary, previousPage: this.summary.currentPage, currentPage: HOMEPAGE };
    this.onHomeClick();
    }
  onClearCacheClick(){
      try {
        window.localStorage.removeItem(KEYhalwaProducts);
        window.localStorage.removeItem(KEYsummary);
        window.localStorage.removeItem(KEYsiteUser);
      } catch (e) {
          console.error('Error clearing localStorage:', e);
      }
    }
  onClearCartClick(){
    setState(getProductsCONSTANT());
    setSummary({ ...this.summary, totalCount: 0, totalPrice: 0, orderPlaced: false });
  }

    // FIX: Removed unnecessary Promise.resolve() wrapper
    onOrderConfirmationClick() {
        this.hideAll();
        this.orderConfirmationClass = 'slds-show';
        this.isActive_OrderConfirmation = true;
        this.updateDocumentTitle('Order Confirmation');
    }

    handleBackToHome() {
        setState(getProductsCONSTANT());
        // FIX: Spreading ...this.summary to preserve other unrelated state data
        setSummary({ 
            ...this.summary, 
            totalCount: 0, totalPrice: 0, loggedIn: true, orderPlaced: false, newUser: false, 
            previousPage: ORDERCONFIRMATIONPAGE, currentPage: HOMEPAGE, nextPage: PRODUCTSPAGE 
        });
        this.onHomeClick();
    }
    handleContinueShopping() {
    //reset state and summary to defaults when going back to home
        setState(getProductsCONSTANT());
        // FIX: Spreading ...this.summary
        setSummary({ 
            ...this.summary, 
            totalCount: 0, totalPrice: 0, loggedIn: true, orderPlaced: false, newUser: false, 
            previousPage: ORDERCONFIRMATIONPAGE, currentPage: PRODUCTSPAGE, nextPage: CARTPAGE 
        });
        this.onProductsClick();
    }

    hideAll() {
        this.setSectionVisibility(); // no-op reset
    }

    handleProductCount(event) {
      this.productCount = event.detail.productCount;
    }

    handleCheckOut(event) {
        this.summary = getSummary();

    // If not logged in, route Cart -> Login -> Checkout
    if (this.summary && this.summary.loggedIn === false) {
            setSummary({
                ...this.summary,
                previousPage: CARTPAGE,
                currentPage: LOGINPAGE,
                nextPage: CHECKOUTPAGE
            });
            this.onLoginClick();
            this.handleScrollTop();
            return;
        }

    // Logged in: go straight to Checkout
        setSummary({
            ...this.summary,
            previousPage: CARTPAGE,
            currentPage: CHECKOUTPAGE,
            nextPage: ORDERCONFIRMATIONPAGE
        });
        this.onCheckoutClick();
        this.handleScrollTop();
    }

    handleOrderConfirmationClick() {
        this.onOrderConfirmationClick();
        this.handleScrollTop();
    }
  handleLogin(){
        this.summary = getSummary();
    if(this.summary.nextPage === CHECKOUTPAGE){ 
      setSummary({ ...this.summary, 
                previousPage: this.summary.currentPage,
                currentPage: CHECKOUTPAGE, 
        nextPage: ORDERCONFIRMATIONPAGE });
            this.onCheckoutClick();
        } else {
      setSummary({ ...this.summary,
                currentPage: PRODUCTSPAGE, 
        nextPage: CARTPAGE });
            this.onProductsClick();
        }
    }
  handleScrollTop() { // Scroll the entire window to the top 
    window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
        // adds smooth animation
    });
    }
  onInitializeDataClick(){
        initializeData().then(() => {
      // Optionally, you can refresh the page or re-fetch data here to reflect the initialized data
    })
    .catch(error => {
            console.error('Error initializing data:', error);
        });
    // Call Apex method to initialize data
    }
}