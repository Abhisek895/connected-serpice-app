// email.js

// Initialize EmailJS
emailjs.init("qgWVYsRXJqxa5JJ8D");

window.sendFinalResponseEmail = function(place, food, date, time, dodgeCount) {
    const summaryMessage = `
❤️ Date Proposal Accepted! ❤️

She said YES! Here are the details of the date:

📍 Place: ${place}
🍽️ Food: ${food}
📅 Date: ${date}
⏰ Time: ${time}

She tried to click "No" ${dodgeCount} times before giving up and saying Yes! 😂

Generated: ${new Date().toLocaleString()}
`;

    console.log("Summary:", summaryMessage);
};
