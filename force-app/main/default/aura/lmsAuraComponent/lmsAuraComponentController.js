({
    // Function that handles received messages from the Lightning Message Service
    handleMessage: function(component, message) {
        // Check if the message is valid and contains data
        if (message != null && message.getParam("lmsData") != null) {
            // Store the received message in the "messageRecieved" variable
            component.set("v.messageRecieved", message.getParam("lmsData").value);
        }
    },

    // Function that runs when a user types in the input field
    inputHandler: function(component, event) {
        console.log(event.target.value); // Logs the entered value to the browser console (useful for debugging)
        
        // Update the "messageValue" variable with the user input
        component.set("v.messageValue", event.target.value);
    },

    // Function to send (publish) the user's message
    publishMessage: function(component) {
        // Get the message that the user typed
        let msg = component.get("v.messageValue");

        // Create a structured message object to send through LMS
        let message = {
            lmsData: { // This is a container for the actual message data
                value: msg // Store the user's message inside the object
            }
        };

        // Find the Lightning Message Channel component and send (publish) the message
        component.find("SampleMessageChannel").publish(message);
    }
})
