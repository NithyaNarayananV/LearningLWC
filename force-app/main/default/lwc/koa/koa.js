import { LightningElement } from 'lwc';
import invokeAgent from '@salesforce/apex/koa.getAgentResponse';

export default class Koa extends LightningElement  {
    sessionId = null;
    userInput = '';
    items = [];
    handleInputChange(event) {
        this.userInput = event.target.value;
    }
    nextId = 1;
    chatMessages =[];
    handleSend(event){
        if (!this.userInput.trim()) return;
        this.userInput = event.target.value;
        //if(this.userInput.length <0) {
        //    alert('Please enter a message');
        //    return
        //}
        
        
        this.chatMessages = [
            ...this.chatMessages,{id: this.nextId, text:this.userInput}];
        //this.chatMessages.push({ id: this.nextId, text: `${this.userInput}` });
this.userInput = '';
        const userMsg = `User: ${this.userInput}`;
        this.chatHistory = [...this.chatHistory, userMsg];

        getAgentResponse({ userPrompt: this.userInput, sessionId: this.sessionId })
            .then(response => {
                const agentMsg = `Agentforce: ${response}`;
                this.chatHistory = [...this.chatHistory, agentMsg];
                this.userInput = '';
            })
            .catch(error => {
                this.chatHistory = [...this.chatHistory, `Agentforce: Error - ${error.body.message}`];
            });
            this.nextId += 1;
            this.userInput = '';

            
    }



}