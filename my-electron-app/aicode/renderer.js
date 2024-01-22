// Navigate to AI application
document.getElementById('searchButton').addEventListener('click', () => {
    aiapp.navToSearch();
});


// On Send, send user message and get response.
document.getElementById('sendButton').addEventListener('click', () => {
    let usermessage = document.getElementById('userinput');
    let messages = document.getElementById('chatmessages');

    if (usermessage.value != "") {
        // CONSTRUCT MESSAGE DIV TO DISPLAY
        let user_out = document.createElement('div')
        user_out.classList ="message sent";
        user_out.textContent = usermessage.value;
        // CLEAR INPUT
        usermessage.value = "";
        // DISPLAY MESSAGE
        messages.appendChild(user_out);

        // Add slight delay
        setTimeout(function() {
            let ai_message = document.createElement('div');
            ai_message.classList = "message received";
            ai_message.textContent = "Coming soon!";
            messages.appendChild(ai_message);
        }, 500);
        // CONSTRUCT & APPEND RESPONSE
        //let ai_message = document.createElement('div');
        //ai_message.classList = "message received";
        //ai_message.textContent = "Coming soon!";
        //messages.appendChild(ai_message);
    } else {}
 
});