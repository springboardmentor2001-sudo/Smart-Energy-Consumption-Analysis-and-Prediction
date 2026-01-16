// REGISTER
function registerUser() {
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value.trim();

    if (!name || !email || !password) {
        alert("All fields are required");
        return;
    }

    const user = { name, email, password };

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("isLoggedIn", "false");

    alert("Registration successful");
    window.location.href = "login.html";
}


// LOGIN
function loginUser() {
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value.trim();

    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
        alert("User not found. Please register.");
        window.location.href = "register.html";
        return;
    }

    if (email === storedUser.email && password === storedUser.password) {
        localStorage.setItem("isLoggedIn", "true");
        window.location.href = "index.html";
    } else {
        alert("Invalid email or password");
    }
}




