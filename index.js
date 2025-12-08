    /************** HÀM LÀM VIỆC VỚI USERS **************/
    function getUsers() {
        var text = localStorage.getItem("users");
        if (text === null) return {};
        return JSON.parse(text);
    }

    function saveUsers(users) {
        localStorage.setItem("users", JSON.stringify(users));
    }

    // Tạo sẵn 1 tài khoản admin: admin1 / 1
    function initDefaultAdmin() {
        var users = getUsers();
        if (!users["admin1"]) {
            users["admin1"] = {
                password: "1",
                role: "admin",
                createdAt: new Date().toLocaleString("vi-VN")
            };
            saveUsers(users);
        }
    }

    /************** ĐĂNG KÝ USER **************/
    function handleRegister() {
        var username = document.getElementById("username").value.trim();
        var password = document.getElementById("password").value.trim();

        if (username === "" || password === "") {
            alert("Vui lòng nhập đầy đủ username và password!");
            return;
        }

        var users = getUsers();

        if (users[username]) {
            alert("Tài khoản đã tồn tại!");
            return;
        }

        // Chỉ cho đăng ký loại user (theo đề bài)
        users[username] = {
            password: password,
            role: "user",
            createdAt: new Date().toLocaleString("vi-VN")
        };

        saveUsers(users);
        alert("Đăng ký thành công! Bạn có thể đăng nhập.");
    }

    /************** ĐĂNG NHẬP **************/
    function handleLogin(event) {
        event.preventDefault();

        var username = document.getElementById("username").value.trim();
        var password = document.getElementById("password").value.trim();

        if (username === "" || password === "") {
            alert("Vui lòng nhập username và password!");
            return;
        }

        var users = getUsers();
        var user = users[username];

        if (!user || user.password !== password) {
            alert("Sai tài khoản hoặc mật khẩu!");
            return;
        }

        // Lưu phiên đăng nhập
        localStorage.setItem("currentUser", username);

        // Chuyển trang theo quyền
        if (user.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "user.html";
        }
    }

    /************** KHỞI TẠO **************/
    window.onload = function () {
        initDefaultAdmin();

        var loginForm = document.getElementById("loginForm");
        loginForm.onsubmit = handleLogin;

        var registerBtn = document.getElementById("registerBtn");
        if (registerBtn) {
            registerBtn.onclick = handleRegister;
        }
    };

