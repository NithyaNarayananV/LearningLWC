({
    handleMessage: function(component, message) {
    
    },
    inputHandler:function(component, event) {
        console.log(event.target.value)
        component.set("v.message", event.target.value);
    }
    
})