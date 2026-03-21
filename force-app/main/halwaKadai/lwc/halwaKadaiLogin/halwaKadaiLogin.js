import { LightningElement, track } from 'lwc';
// 1. Import the new Toast module
import LightningToast from 'lightning/toast';
import sendEmailOTP from '@salesforce/apex/Halwakadai_HelperClass.sendEmailOTP';
import searchContact from '@salesforce/apex/Halwakadai_HelperClass.searchContactF';
import { getState, setState, setSummary, getSummary, subscribe as stateSubscribe, setSiteUser, loadDraftOrder } from 'c/halwaKadaiUtils';

export default class HalwaKadaiLogin extends LightningElement {
    email = '';
    otpSent = false;
    otp = '';
    generatedOTP = '';
    
    @track summary;
    @track siteUser = {}; // Initialized to prevent undefined errors
    newUser = true;
    contactDetails; // Fixed typo from contactDeailts
    unsub;

    connectedCallback() {
        // 1. Initial Load
        this.summary = getSummary();

        // 2. Subscribe to future changes
        this.unsub = stateSubscribe((data) => {
            this.summary = data.summary;
            console.log('HalwaKadaiLogin : Sync Complete: Count is ' + this.summary.totalCount);
        });
    }

    disconnectedCallback() {
        if (this.unsub) {
            this.unsub();
            this.unsub = null;
        }
    }

    handleEmailChange(event) {
        this.email = event.target.value;
        this.siteUser = { ...this.siteUser, Email: this.email };
    }
    
    async handleSendOTP() {
        if (!this.email || !this.email.includes('@')) {
            this.showToast('Error', 'Please enter a valid email address', 'error');
            return;
        }

        try {
            const result = await sendEmailOTP({ email: this.email });

            if (result) {
                this.generatedOTP = result;
                this.otpSent = true;

                console.log('OTP sent to email:', this.email);
                
                // For testing purposes (as per your original code)
                this.otp = this.generatedOTP;
                
                setSiteUser(this.siteUser);
                this.showToast('Success', 'OTP has been sent to your email', 'success');
            } else {
                this.showToast('Error', 'Failed to generate OTP', 'error');
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            this.showToast('Error', 'Something went wrong while sending OTP', 'error');
        }
    }

    showToast(label, message, variant) {
        LightningToast.show({
            label: label, 
            message: message,
            variant: variant,
            mode: 'dismissible'
        }, this);
    }

    handleOTPChange(event) {
        this.otp = event.target.value;
    }

    async handleLogin(event) {
        event.preventDefault(); 
        
        // Safe string comparison for OTP
        if (String(this.otp) === String(this.generatedOTP)) {
            this.showToast('Success', 'Login successful', 'success');
            
            try {
                const contact = await searchContact({ email: this.email });
                if (contact) {
                    this.newUser = false;
                    this.contactDetails = contact;
                    
                    this.siteUser = {
                        ...this.siteUser,
                        Id: contact.Id,
                        Name: contact.Name, 
                        Email: contact.Email, 
                        Street: contact.MailingStreet, 
                        City: contact.MailingCity, 
                        State: contact.MailingState, 
                        PostalCode: contact.MailingPostalCode, 
                        Country: contact.MailingCountry, 
                        MobilePhone: contact.Phone
                    };
                    
                    // 1. Set the user FIRST so loadDraftOrder knows who is logged in
                    setSiteUser(this.siteUser);
                    
                    // 2. Fetch draft order and populate state
                    await loadDraftOrder();
                    
                } else {
                    this.newUser = true;
                    console.log('HalwaKadaiLogin : No contact found for email:', this.email);
                }
            } catch (error) {
                console.error('Error fetching contact:', error);
            }
            
            // FIX: Pass ONLY the fields that changed to prevent overwriting the Draft Order math!
            setSummary({
                loggedIn: true,
                newUser: this.newUser
            });

            // Dispatch event to parent to handle UI navigation
            this.dispatchEvent(new CustomEvent('login', {
                bubbles: true,
                composed: true
            }));
            
        } else {
            this.showToast('Invalid OTP', 'Please Enter Correct OTP', 'error');
        }
    }
}