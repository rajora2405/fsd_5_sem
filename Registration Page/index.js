const email = document.getElementById("email");
const btn = document.getElementById("btn");
const name = document.getElementById("name");
const password = document.getElementById("password");

const div = document.getElementById("students");

btn.addEventListener("click", (e) => {
    e.preventDefault();

    const innerdiv = document.createElement("div");

    innerdiv.innerHTML = `
        <h3>Student Details</h3>
        <p>Name: ${name.value}</p>
        <p>Email: ${email.value}</p>
        <p>Password: ${password.value}</p>
        <hr>
    `;

    div.appendChild(innerdiv);

    // Clear input fields
    name.value = "";
    email.value = "";
    password.value = "";
});