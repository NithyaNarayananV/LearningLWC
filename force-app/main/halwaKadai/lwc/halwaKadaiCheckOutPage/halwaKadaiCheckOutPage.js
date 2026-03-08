import { LightningElement } from 'lwc';
import { getState, getSummary, subscribe as stateSubscribe, getSiteUser, setSiteUser, setSummary } from 'c/halwaKadaiUtils';
import createOrderWithContact from '@salesforce/apex/Halwakadai_HelperClass.createOrderWithContact';
import createContact from '@salesforce/apex/Halwakadai_HelperClass.createContact';
import sendOrderConfirmationEmail from '@salesforce/apex/Halwakadai_HelperClass.sendOrderConfirmationEmail';

export default class HalwaKadaiCheckOutPage extends LightningElement {
    halwaProducts;
    summary;
    siteUser;
    contactDetailsChanges=false;

    isPlaceOrderDisabled = false;

    connectedCallback() {
        // Initial load
        this.siteUser = getSiteUser();
        this.halwaProducts = getState();
        this.summary = getSummary();
        console.log('HalwaKadaiCheckOutPage : connectedCallback :  siteUser = ', this.siteUser);
        console.log('HalwaKadaiCheckOutPage : connectedCallback :  halwaProducts = ', this.halwaProducts);
        console.log('HalwaKadaiCheckOutPage : connectedCallback :  summary = ', this.summary);

        window.addEventListener('beforeunload', this.onPlaceOrderHandler.bind(this));

        // Subscribe to cart changes
        this.unsub = stateSubscribe((data) => {
            this.halwaProducts = data.products;
            this.summary = data.summary;
            this.siteUser = data.siteUser;
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
    setName(event) { this.siteUser.name = event.target.value.trim(); this.validateField(event, "Name cannot be empty", this.siteUser.name);   this.contactDetailsChanges=true; }
    setStreet(event) { this.siteUser.Street = event.target.value.trim(); this.validateField(event, "Street cannot be empty", this.siteUser.Street);   this.contactDetailsChanges=true; }
    setCity(event) { this.siteUser.City = event.target.value.trim(); this.validateField(event, "City cannot be empty", this.siteUser.City);   this.contactDetailsChanges=true; }
    setState(event) { this.siteUser.State = event.target.value.trim(); this.validateField(event, "State cannot be empty", this.siteUser.State);   this.contactDetailsChanges=true; }
    setPostalCode(event) { this.siteUser.PostalCode = event.target.value.trim(); this.validateField(event, "Postal Code cannot be empty", this.siteUser.PostalCode);   this.contactDetailsChanges=true; }
    setCountry(event) { this.siteUser.Country = event.target.value.trim(); this.validateField(event, "Country cannot be empty", this.siteUser.Country);   this.contactDetailsChanges=true; }
    setPhone(event) { this.siteUser.MobilePhone = event.target.value.trim(); this.validateField(event, "Phone cannot be empty", this.siteUser.MobilePhone);   this.contactDetailsChanges=true; }
    setEmail(event) {
        this.siteUser.email = event.target.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.siteUser.email)) {
            event.target.setCustomValidity("Enter a valid email address");
        } else {
            event.target.setCustomValidity("");
        }
        event.target.reportValidity();
        this.contactDetailsChanges=true;
    }
    setCountry(event) { this.siteUser.Country = event.target.value.trim(); this.validateField(event, "Country cannot be empty", this.siteUser.Country);   this.contactDetailsChanges=true; }    

    // Enable/disable Place Order
    allValueSet() {
        console.log('allValueSet() : siteUser = ', this.siteUser);
        if (
            this.siteUser.name && this.siteUser.street && this.siteUser.city && this.siteUser.state &&
            this.siteUser.postalCode && this.siteUser.country && this.siteUser.MobilePhone && this.siteUser.email
        ) {

            this.isPlaceOrderDisabled = false;
            console.log('allValueSet() : All values are set, enabling Place Order');
        } else {
            this.isPlaceOrderDisabled = true;
            console.log('allValueSet() : Some values are missing, disabling Place Order');
        }
    }

    // Place order handler
    onPlaceOrderHandler(event) {
        setSiteUser(this.siteUser);
        console.log('onPlaceOrderHandler');

        if(this.siteUser.id == 'newContact'){
            console.log('Placing order for the first time');
            createContact({
                name: this.siteUser.name,
                phone: this.siteUser.MobilePhone,
                email: this.siteUser.Email,
                street: this.siteUser.street,
                city: this.siteUser.city,
                state: this.siteUser.state,
                postalCode: this.siteUser.postalCode,
                country: this.siteUser.country
            })
            .then(result => {
                console.log('Contact created successfully: ', result);
                this.siteUser.id = result; // Update siteUser with new contact ID
                setSiteUser(this.siteUser); // Update siteUser in utils with new contact ID
                //create order with new contact
            })
            .catch(error => {
                console.error('Error creating contact: ', error);
            });
        }
        if(this.siteUser.id !== 'newContact'){
            console.log('Existing contact, will update details if changed');
            //Update contact here if needed
            if(this.contactDetailsChanges){
                console.log('Contact details changed, updating siteUser in utils');
                //Update contact here
            }
            //create order with existing contact
            createOrderWithContact({
                products: this.halwaProducts,
                name: this.siteUser.name,
                phone: this.siteUser.MobilePhone,
                email: this.siteUser.Email,
                street: this.siteUser.street,
                city: this.siteUser.city,
                state: this.siteUser.state,
                postalCode: this.siteUser.postalCode,
                country: this.siteUser.country,
                contactId: this.siteUser.id
            })
            .then(result => {
                console.log('Order created successfully: ', result);
                sendOrderConfirmationEmail({orderId: result});
                this.summary.orderPlaced = true;
                this.summary.orderId = result;
                // Dispatch event before state changes
                this.handleOrderConfirmationClick();
            })
            .catch(error => {
                console.error('Error creating order: ', error);
            });
        }
        if(this.summary.orderPlaced){
            console.log('Order already placed, skipping order creation');
            return;
        }
        event.preventDefault();
        //setSummary({ totalCount: 0, totalPrice: 0, loggedIn: this.summary.loggedIn, orderPlaced: true, newUser: false });

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