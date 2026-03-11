import { LightningElement } from 'lwc';
import {
    getState,
    getSummary,
    subscribe as stateSubscribe,
    getSiteUser,
    setSiteUser,
    setSummary
} from 'c/halwaKadaiUtils';

import createOrderWithContact from '@salesforce/apex/Halwakadai_HelperClass.createOrderWithContact';
import createContact from '@salesforce/apex/Halwakadai_HelperClass.createContact';
import sendOrderConfirmationEmail from '@salesforce/apex/Halwakadai_HelperClass.sendOrderConfirmationEmail';

export default class HalwaKadaiCheckOutPage extends LightningElement {
    halwaProducts;
    summary;
    siteUser;
    contactDetailsChanges = false;
    isLoading = false;
    isPlaceOrderDisabled = false;

    // If you really want a beforeunload handler, keep a bound reference:
    // boundBeforeUnload = null;

    connectedCallback() {
        // Initial load
        this.siteUser = getSiteUser();
        this.halwaProducts = getState();
        this.summary = getSummary();
        console.log('HalwaKadaiCheckOutPage : connectedCallback :  siteUser = ', this.siteUser);
        console.log('HalwaKadaiCheckOutPage : connectedCallback :  halwaProducts = ', this.halwaProducts);
        console.log('HalwaKadaiCheckOutPage : connectedCallback :  summary = ', this.summary);

        // ⚠️ Strongly recommended to REMOVE this; it won’t render the overlay anyway.
        // If you only want to WARN the user about leaving, attach a simple handler instead.
        // this.boundBeforeUnload = this.beforeUnloadHandler.bind(this);
        // window.addEventListener('beforeunload', this.boundBeforeUnload);

        // Subscribe to cart changes
        this.unsub = stateSubscribe((data) => {
            this.halwaProducts = data.products;
            this.summary = data.summary;
            this.siteUser = data.siteUser;
            console.log('CART Sync Complete: Count is ' + this.summary.totalCount);
        });
    }

    disconnectedCallback() {
        console.log('disconnectedCallback');
        // if (this.boundBeforeUnload) {
        //     window.removeEventListener('beforeunload', this.boundBeforeUnload);
        //     this.boundBeforeUnload = null;
        // }
        if (this.unsub) {
            try { this.unsub(); } catch (e) { /* ignore */ }
        }
    }

    // If you absolutely must prevent unload:
    // beforeUnloadHandler(event) {
    //     if (!this.summary?.orderPlaced) {
    //         event.preventDefault();
    //         event.returnValue = ''; // triggers browser native “Leave site?” prompt
    //     }
    // }

    // ---------- Validation & setters ----------
    validateField(event, message, value) {
        if (!value) {
            event.target.setCustomValidity(message);
        } else {
            event.target.setCustomValidity('');
        }
        event.target.reportValidity();
        // Only compute disabled state in one place:
        this.allValueSet();
    }
    // Setters
    setName(event) {
        this.siteUser.Name = event.target.value.trim();
        this.validateField(event, 'Name cannot be empty', this.siteUser.Name);
        this.contactDetailsChanges = true;
    }
    setStreet(event) {
        this.siteUser.Street = event.target.value.trim();
        this.validateField(event, 'Street cannot be empty', this.siteUser.Street);
        this.contactDetailsChanges = true;
    }
    setCity(event) {
        this.siteUser.City = event.target.value.trim();
        this.validateField(event, 'City cannot be empty', this.siteUser.City);
        this.contactDetailsChanges = true;
    }
    setState(event) {
        this.siteUser.State = event.target.value.trim();
        this.validateField(event, 'State cannot be empty', this.siteUser.State);
        this.contactDetailsChanges = true;
    }
    setPostalCode(event) {
        this.siteUser.PostalCode = event.target.value.trim();
        this.validateField(event, 'Postal Code cannot be empty', this.siteUser.PostalCode);
        this.contactDetailsChanges = true;
    }
    setCountry(event) {
        this.siteUser.Country = event.target.value.trim();
        this.validateField(event, 'Country cannot be empty', this.siteUser.Country);
        this.contactDetailsChanges = true;
    }
    setPhone(event) {
        this.siteUser.MobilePhone = event.target.value.trim();
        this.validateField(event, 'Phone cannot be empty', this.siteUser.MobilePhone);
        this.contactDetailsChanges = true;
    }
    setEmail(event) {
        this.siteUser.Email = event.target.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.siteUser.Email)) {
            event.target.setCustomValidity('Enter a valid email address');
        } else {
            event.target.setCustomValidity('');
        }
        event.target.reportValidity();
        this.contactDetailsChanges = true;
    }

    // Enable/disable Place Order
    allValueSet() {
        console.log('HalwaKadaiCheckOutPage : allValueSet : siteUser = ', this.siteUser);
        const u = this.siteUser || {};
        const allSet =
            !!u.Name &&
            !!u.Street &&
            !!u.City &&
            !!u.State &&
            !!u.PostalCode &&
            !!u.Country &&
            !!u.MobilePhone &&
            !!u.Email;

        this.isPlaceOrderDisabled = !allSet;

        console.log('HalwaKadaiCheckOutPage : allValueSet: isPlaceOrderDisabled = ', this.isPlaceOrderDisabled);
        if (!allSet) {
            console.log('HalwaKadaiCheckOutPage : allValueSet: Missing fields:', JSON.stringify(u));
        }
    }

    // ---------- Main: Place order ----------
    async onPlaceOrderHandler(event) {
        try {
            console.log('HalwaKadaiCheckOutPage : onPlaceOrderHandler()');
            if (event?.preventDefault) event.preventDefault();

            this.isLoading = true; // <-- overlay shows
            setSiteUser(this.siteUser);

            // Avoid duplicate orders
            if (this.summary?.orderPlaced) {
                console.log('HalwaKadaiCheckOutPage : onPlaceOrderHandler : Order already placed, skipping.');
                return;
            }

            // Create (or reuse) Contact
            if (this.siteUser.id === 'newContact') {
                console.log('HalwaKadaiCheckOutPage : onPlaceOrderHandler : Creating Contact for new user...');
                const contactId = await createContact({
                    name: this.siteUser.Name,
                    phone: this.siteUser.MobilePhone,
                    email: this.siteUser.Email,
                    street: this.siteUser.Street,
                    city: this.siteUser.City,
                    state: this.siteUser.State,
                    postalCode: this.siteUser.PostalCode,
                    country: this.siteUser.Country
                });

                this.siteUser.id = contactId;
                setSiteUser(this.siteUser);
                console.log('HalwaKadaiCheckOutPage : onPlaceOrderHandler : Contact created:', contactId);
            } else {
                console.log('HalwaKadaiCheckOutPage : onPlaceOrderHandler : Existing Contact; update if needed (contactDetailsChanges =', this.contactDetailsChanges, ')');
                // If you plan to update contact, await that here before order creation.
            }

            // Create Order (await so overlay stays)
            const orderId = await this.createOrder();

            // Mark state & send email (await)
            this.summary.orderPlaced = true;
            this.summary.orderId = orderId;

            await sendOrderConfirmationEmail({ orderId });
            console.log('Confirmation email sent for order:', orderId);
            this.handleOrderConfirmationClick();
        } catch (e) {
            console.error('HalwaKadaiCheckOutPage : onPlaceOrderHandler : error:', e);
        } finally {
            this.isLoading = false; // <-- overlay hides
        }
    }

    // Return the order Id
    async createOrder() {
        console.log('HalwaKadaiCheckOutPage : createOrder()');
        if(this.siteUser.id !== 'newContact')
        console.log('createOrder() with contactId:', this.siteUser.id);
        const orderId = await createOrderWithContact({
            products: this.halwaProducts,
            name: this.siteUser.Name,
            phone: this.siteUser.MobilePhone,
            email: this.siteUser.Email,
            street: this.siteUser.Street,
            city: this.siteUser.City,
            state: this.siteUser.State,
            postalCode: this.siteUser.PostalCode,
            country: this.siteUser.Country,
            contactId: this.siteUser.id
        });

        console.log('HalwaKadaiCheckOutPage : createOrder : Order created successfully: ', orderId);
        return orderId;
    }

    handleOrderConfirmationClick() {
        console.log('HalwaKadaiCheckOutPage : handleOrderConfirmationClick()');
        try {
            const orderConfirmationEvent = new CustomEvent('orderconfirmation', {
                bubbles: true,
                composed: true,
                detail: { orderId: this.summary?.orderId }
            });
            this.dispatchEvent(orderConfirmationEvent);
        } catch (error) {
            console.error('HalwaKadaiCheckOutPage : handleOrderConfirmationClick : Error dispatching order confirmation event:', error);
        }
    }
}