import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import sendEmailOTP from '@salesforce/apex/Halwakadai_HelperClass.sendEmailOTP';

export default class HalwaKadaiLogin extends LightningElement {
    email = '';
    otpSent = false;
    otp = '';
    generatedOTP = '';

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

                this.showToast('Success', 'OTP has been sent to your email', 'success');
            } else {
                this.showToast('Error', 'Failed to generate OTP', 'error');
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            this.showToast('Error', 'Something went wrong while sending OTP', 'error');
        }
    }
    showToast(title, message, variant) { this.dispatchEvent( new ShowToastEvent({ title, message, variant }) ); }

    handleOTPChange(event) {
        this.otp = event.target.value;
         console.log('Entered OTP:', this.otp);
    }
    handleLogin() {
        event.preventDefault(); // stops the form from submitting
        if(this.otp.length==4 && this.otp == this.generatedOTP) {
            this.showToast('Success', 'Login successful', 'success');
        } else {
            this.showToast('Invalid OTP', 'Please Enter Correct OTP', 'error');
        }
    }
}
