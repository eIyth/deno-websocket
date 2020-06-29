let ws;
let chatUsersCtr = document.querySelector('#chatUsers');
let chatUsersCount = document.querySelector('#chatUsersCount');
let sendMessageForm = document.querySelector('#messageSendForm');
let messageInput = document.querySelector("#messageInput");
let chatMessages = document.querySelector("#chatMessages");

window.addEventListener('DOMContentLoaded', () => {
    ws = new WebSocket('ws://localhost:3000/ws');
    ws.addEventListener('open', onConnectionOpen);
    ws.addEventListener('message', onMessageRecieved);
})

sendMessageForm.onsubmit = (ev) => {
    ev.preventDefault();
    const event = {
        event : 'message',
        data: messageInput.value
    }
    ws.send(JSON.stringify(event));
    messageInput.value = '';
}

function onConnectionOpen(){
    console.log('Connection oppened');
    const queryParams = getQueryParams();
    if (!queryParams.name || !queryParams.group) {
        window.location.href = "chat.html";
        return;
    } 
    const event = {
        event: "join",
        groupName: queryParams.group,
        name: queryParams.name
    };
    ws.send(JSON.stringify(event)); 
}

function onMessageRecieved(event){
    console.log('Message recieved');
    event = JSON.parse(event.data);
    console.log(event);

    switch (event.event) {
        case "users":
            chatUsersCount.innerHTML = event.data.length;
            chatUsersCtr.innerHTML = '';
            event.data.forEach(u => {
                const userElt = document.createElement('div');
                userElt.className = 'chat-users';
                userElt.innerHTML = u.name;
                chatUsersCtr.appendChild(userElt);
            });
            break;
        case "message":
            appendMessage(event.data);
            break;
        case "previousMessages":
            event.data.forEach(appendMessage);
    }
}

function getQueryParams(){
    const search = window.location.search.substring(1);
    const pairs = search.split("&");
    const params = {};
    for (const pair of pairs) {
        const parts = pair.split("=");
        params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
    }

    return params;
}

function appendMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${message.sender === 'me' ? 'to' : 'from'}`;
    messageEl.innerHTML = `
    ${message.sender === 'me' ? '' : `<h4>${message.name}</h4>`} 
    <p class = "message-text"> ${message.message} </p>`;
    chatMessages.appendChild(messageEl);
}