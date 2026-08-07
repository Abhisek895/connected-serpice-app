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

    emailjs.send(
        "service_4ssqd0a",
        "template_04jpqfo",
        {
            title: "Crush Proposal Game Data",
            name: "Proposal Game",
            email: "noreply@example.com",
            message: summaryMessage
        }
    )
    .then((response) => {
        console.log("SUCCESS! Email sent.", response.status, response.text);
    })
    .catch((error) => {
        console.error("FAILED to send email.", error);
    });
};
