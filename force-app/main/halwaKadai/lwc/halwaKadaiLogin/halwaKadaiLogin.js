import { LightningElement } from 'lwc';
// 1. Import the new Toast module
import LightningToast from 'lightning/toast';
import sendEmailOTP from '@salesforce/apex/Halwakadai_HelperClass.sendEmailOTP';
import { getState, setState ,setSummary, getSummary, subscribe as stateSubscribe} from 'c/halwaKadaiUtils';

export default class HalwaKadaiLogin extends LightningElement {
    email = '';
    otpSent = false;
    otp = '';
    generatedOTP = '';
    summary='';
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
        console.log('handleLogin');
        if(this.otp.length === 4 && this.otp == this.generatedOTP) {
            this.showToast('Success', 'Login successful', 'success');
            const loginEvent = new CustomEvent('login', {
                bubbles: true,
                composed: true
            });
            this.summary = {
                ...this.summary,
                loggedIn : true
            };
            console.log('HalwaKadaiLogin : handleLogin : B4        setSummary(this.summary);');
            setSummary(this.summary);
            this.dispatchEvent(loginEvent);
            console.log('HalwaKadaiLogin : handleLogin : AF     this.dispatchEvent(loginEvent);');

            // Add navigation logic here
        } else {
            this.showToast('Invalid OTP', 'Please Enter Correct OTP', 'error');
        }
    }

}