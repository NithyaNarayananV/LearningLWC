import { LightningElement } from 'lwc';
import { getState, getSummary, subscribe as stateSubscribe } from 'c/halwaKadaiUtils';
import createOrderWithContact from '@salesforce/apex/Halwakadai_HelperClass.createOrderWithContact';
import sendOrderConfirmationEmail from '@salesforce/apex/Halwakadai_HelperClass.sendOrderConfirmationEmail';

export default class HalwaKadaiCheckOutPage extends LightningElement {
    halwaProducts;
    summary;

    // Contact fields
    name = '';
    street = '';
    city = '';
    state = '';
    postalCode = '';
    country = 'India';
    phone = '';
    email = '';

    isPlaceOrderDisabled = true;

    connectedCallback() {
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
        console.log('disconnectedCallback : onPlaceOrderHandler');
        this.onPlaceOrderHandler();
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
    setName(event) { this.name = event.target.value.trim(); this.validateField(event, "Name cannot be empty", this.name); }
    setStreet(event) { this.street = event.target.value.trim(); this.validateField(event, "Street cannot be empty", this.street); }
    setCity(event) { this.city = event.target.value.trim(); this.validateField(event, "City cannot be empty", this.city); }
    setState(event) { this.state = event.target.value.trim(); this.validateField(event, "State cannot be empty", this.state); }
    setPostalCode(event) { this.postalCode = event.target.value.trim(); this.validateField(event, "Postal Code cannot be empty", this.postalCode); }
    setCountry(event) { this.country = event.target.value.trim(); this.validateField(event, "Country cannot be empty", this.country); }
    setPhone(event) { this.phone = event.target.value.trim(); this.validateField(event, "Phone cannot be empty", this.phone); }
    setEmail(event) {
    this.email = event.target.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
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
    onPlaceOrderHandler() {
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