import { LightningElement } from 'lwc';
import { getState, getSummary, subscribe as stateSubscribe, getSiteUser, setSiteUser } from 'c/halwaKadaiUtils';
import createOrderWithContact from '@salesforce/apex/Halwakadai_HelperClass.createOrderWithContact';
import sendOrderConfirmationEmail from '@salesforce/apex/Halwakadai_HelperClass.sendOrderConfirmationEmail';

export default class HalwaKadaiCheckOutPage extends LightningElement {
    halwaProducts;
    summary;
    siteUser;

    isPlaceOrderDisabled = false;

    connectedCallback() {
        this.siteUser = getSiteUser();
        console.log('HalwaKadaiCheckOutPage : connectedCallback :  siteUser = ', this.siteUser);
        console.log('HalwaKadaiCheckOutPage : connectedCallback');

        window.addEventListener('beforeunload', this.onPlaceOrderHandler.bind(this));

        // Initial load
        this.halwaProducts = getState();
        this.summary = getSummary();

        // Subscribe to cart changes
        this.unsub = stateSubscribe((data) => {
            this.halwaProducts = data.products;
            this.summary = data.summary;
            console.log('CART Sync Complete: Count is ' + this.summary.totalCount);
        });
    }
    disconnectedCallback(){
        console.log('disconnectedCallback : removeEventListener');
        if(this.summary.loggedIn)
        window.removeEventListener('beforeunload', this.onPlaceOrderHandler.bind(this));
        console.log('disconnectedCallback : onPlaceOrderHandler');
        //this.onPlaceOrderHandler();
    }
    // Generic validation
    validateField(event, message, value) {
        if (!value) {
            event.target.setCustomValidity(message);
            this.isPlaceOrderDisabled = true;
        } else {
            event.target.setCustomValidity('');
            this.isPlaceOrderDisabled = false;
        }
        this.allValueSet();
        event.target.reportValidity();
    }

    // Setters
    setName(event) { this.siteUser.name = event.target.value.trim(); this.validateField(event, "Name cannot be empty", this.siteUser.name); setSiteUser(this.siteUser); }
    setStreet(event) { this.siteUser.Street = event.target.value.trim(); this.validateField(event, "Street cannot be empty", this.siteUser.Street); setSiteUser(this.siteUser); }
    setCity(event) { this.siteUser.City = event.target.value.trim(); this.validateField(event, "City cannot be empty", this.siteUser.City); setSiteUser(this.siteUser); }
    setState(event) { this.siteUser.State = event.target.value.trim(); this.validateField(event, "State cannot be empty", this.siteUser.State); setSiteUser(this.siteUser); }
    setPostalCode(event) { this.siteUser.PostalCode = event.target.value.trim(); this.validateField(event, "Postal Code cannot be empty", this.siteUser.PostalCode); setSiteUser(this.siteUser); }
    setCountry(event) { this.siteUser.Country = event.target.value.trim(); this.validateField(event, "Country cannot be empty", this.siteUser.Country); setSiteUser(this.siteUser); }
    setPhone(event) { this.siteUser.MobilePhone = event.target.value.trim(); this.validateField(event, "Phone cannot be empty", this.siteUser.MobilePhone); setSiteUser(this.siteUser); }
    setEmail(event) {
    this.siteUser.email = event.target.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.siteUser.email)) {
        event.target.setCustomValidity("Enter a valid email address");
    } else {
        event.target.setCustomValidity("");
    }
    event.target.reportValidity();
}

//setEmail(event) { this.email = event.target.value.trim(); this.validateField(event, "Email cannot be empty", this.email); }

    // Enable/disable Place Order
    allValueSet() {
        if (
            this.name && this.street && this.city && this.state &&
            this.postalCode && this.country && this.phone && this.email
        ) {
            this.isPlaceOrderDisabled = false;
        } else {
            this.isPlaceOrderDisabled = true;
        }
    }

    // Place order handler
    onPlaceOrderHandler(event) {
        console.log('onPlaceOrderHandler');

        createOrderWithContact({
            products: this.halwaProducts,
            name: this.name,
            phone: this.phone,
            email: this.email,
            street: this.street,
            city: this.city,
            state: this.state,
            postalCode: this.postalCode,
            country: this.country
        })
        .then(result => {
            console.log('Order created successfully: ', result);
            sendOrderConfirmationEmail({orderId: result});
            // Dispatch event before state changes
            this.handleOrderConfirmationClick();
        })
        .catch(error => {
            console.error('Error creating order: ', error);
        });
            event.preventDefault();
    event.returnValue = '';
    }
    handleOrderConfirmationClick() {
        console.log('handleOrderConfirmationClick()');
        try {
            const orderConfirmationEvent = new CustomEvent('orderconfirmation', {
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(orderConfirmationEvent);
        } catch (error) {
            console.error('Error dispatching order confirmation event:', error);
        }
    }
}