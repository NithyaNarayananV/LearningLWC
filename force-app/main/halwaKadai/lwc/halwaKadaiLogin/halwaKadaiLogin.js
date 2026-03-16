import { LightningElement } from 'lwc';
// 1. Import the new Toast module
import LightningToast from 'lightning/toast';
import sendEmailOTP from '@salesforce/apex/Halwakadai_HelperClass.sendEmailOTP';
import searchContact from '@salesforce/apex/Halwakadai_HelperClass.searchContactF';
import { getState, setState ,setSummary, getSummary, subscribe as stateSubscribe, setSiteUser} from 'c/halwaKadaiUtils';
import Street from '@salesforce/schema/Asset.Street';

export default class HalwaKadaiLogin extends LightningElement {
    email = '';
    otpSent = false;
    otp = '';
    generatedOTP = '';
    summary;
    siteUser;// = {name : '', email: '', Street: '', City: '', State: '', PostalCode: '', Country: '', MobilePhone: ''};
    newUser = true;
    contactDeailts;
    connectedCallback() {
        // 1. Initial Load
        this.summary = getSummary();

        // 2. Subscribe to future changes
        this.unsub = stateSubscribe((data) => {
            // This ensures both variables stay in sync with the utility
            this.summary = data.summary;
            console.log('Sync Complete: Count is ' + this.summary.totalCount);
        });
    }

    handleEmailChange(event) {
        this.email = event.target.value;
        this.siteUser = { ...this.siteUser, Email: this.email };
        console.log('Email:', this.email);
    }
    
    async handleSendOTP() {
        // Basic client-side validation
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
                console.log('Generated OTP:', this.generatedOTP);

                ////delete this line:
                this.otp=this.generatedOTP;
                ///delete this line
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

    // 2. Updated showToast method using lightning/toast
    showToast(label, message, variant) {
        LightningToast.show({
            label: label, // This replaces 'title'
            message: message,
            variant: variant,
            mode: 'dismissible'
        }, this);
    }

    handleOTPChange(event) {
        this.otp = event.target.value;
        console.log('Entered OTP:', this.otp);
    }

    handleLogin(event) {
        event.preventDefault(); 
        console.log('HalwaKadaiLogin : handleLogin');
        console.log('HalwaKadaiLogin : handleLogin : otp : ',this.otp,'|| generatedOTP : ', this.generatedOTP);
        console.log(this.otp.length);
        console.log(this.otp == this.generatedOTP);
        if((this.otp.length === 4 || this.otp.toString().length === 4 ) && this.otp == this.generatedOTP) {
            this.showToast('Success', 'Login successful', 'success');
            searchContact({ email: this.email })
                .then((contact) => {
                    if (contact) {
                        this.newUser = false;
                         this.summary = {
                            ...this.summary,
                            newUser : false};
                        console.log('HalwaKadaiLogin : handleLogin : contact : ', contact);
                        this.contactDeailts = contact;
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
                        console.log('HalwaKadaiLogin : handleLogin : siteUser : ', this.siteUser);
                        setSiteUser(this.siteUser);
                    }else{
                        this.newUser = true;
                        console.log('HalwaKadaiLogin : handleLogin : No contact found for email:', this.email);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching contact:', error);
                });
            const loginEvent = new CustomEvent('login', {
                bubbles: true,
                composed: true
            });
            console.log('HalwaKadaiLogin : handleLogin : B4 Summary Update : this.summary.loggedIn = ', this.summary.loggedIn);
            // Ensure we're logged in and preserve intended next page
            this.summary = {
                ...this.summary,
                loggedIn : true
            };
            console.log('HalwaKadaiLogin : handleLogin : AF Summary Update  this.summary.loggedIn = ', this.summary.loggedIn);
            console.log('HalwaKadaiLogin : handleLogin : B4        setSummary(this.summary);');
            setSummary(this.summary);
            this.dispatchEvent(loginEvent);
            console.log('HalwaKadaiLogin : handleLogin : AF     this.dispatchEvent(loginEvent);');
            // Add navigation logic here - dispatch event to parent to navigate
            // Parent will read summary.nextPage and route accordingly
        } else {
            this.showToast('Invalid OTP', 'Please Enter Correct OTP', 'error');
        }
    }

}