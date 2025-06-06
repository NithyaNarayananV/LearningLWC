import { LightningElement,wire } from 'lwc'; // to use the wire adapter, we need to import LightningElement and wire from lwc
import SAMPLEMC from "@salesforce/messageChannel/SampleMessageChannel__c"; //(Reference a Message Channel in LWC)Need to add the Message Channel details like this
import { MessageContext, publish }  from 'lightning/messageService'; // (LMS API) we can add the additional requeted based on our need inside the curly braces like.. APPLICATION_SCOPE, publish, subscribe, unsubscribe, etc.}
export default class LmsComponentA extends LightningElement {
    inputValue

    @wire(MessageContext)
    context

    inputHandler(event) {
        this.inputValue = event.target.value
    }

    publishMessage() {
        const message = {lmsData:{value:this.inputValue}}
        //publish(messageContext, messageChannel, message)
        publish(this.context,SAMPLEMC,message)
    }
}