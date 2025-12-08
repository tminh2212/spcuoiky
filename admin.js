/************** HỖ TRỢ USERS & PHIÊN ĐĂNG NHẬP **************/
    function getCurrentUser() {
        return localStorage.getItem("currentUser");
    }

    function getUsers() {
        var text = localStorage.getItem("users");
        if (text === null) return {};
        return JSON.parse(text);
    }

    function saveUsers(users) {
        localStorage.setItem("users", JSON.stringify(users));
    }

    // Chỉ cho admin truy cập trang này
    function requireAdmin() {
        var current = getCurrentUser();
        var users = getUsers();
        if (!current || !users[current] || users[current].role !== "admin") {
            alert("Bạn phải đăng nhập với tài khoản admin!");
            window.location.href = "index.html";
            return null;
        }
        return current;
    }

    /************** HIỂN THỊ DANH SÁCH TÀI KHOẢN **************/
    function renderUserTable() {
        var users = getUsers();
        var current = getCurrentUser();
        var tbody = document.getElementById("userList");
        tbody.innerHTML = "";

        for (var username in users) {
            if (!users.hasOwnProperty(username)) continue;
            var u = users[username];

            var tr = document.createElement("tr");

            // Username
            var tdName = document.createElement("td");
            tdName.textContent = username;
            tr.appendChild(tdName);

            // Loại tài khoản
            var tdRole = document.createElement("td");
            tdRole.textContent = u.role;
            tr.appendChild(tdRole);

            // Ngày tạo
            var tdDate = document.createElement("td");
            tdDate.textContent = u.createdAt || "";
            tr.appendChild(tdDate);

            // Hành động
            var tdAction = document.createElement("td");
            if (username === current) {
                tdAction.textContent = "Đang đăng nhập";
                tdAction.className="current-user"
            } else {
                var btnDel = document.createElement("button");
                btnDel.textContent = "Xóa";
                /* gắn class để ăn css nền đỏ, chữ trắng, bo góc */
                btnDel.className = "btn-delete";

                btnDel.onclick = (function (name) {
                return function () {
                deleteUser(name);
    };
})(username);

tdAction.appendChild(btnDel);
            }

            tr.appendChild(tdAction);
            tbody.appendChild(tr);
        }
    }

    /************** TẠO TÀI KHOẢN MỚI **************/
    function handleAddUser(event) {
        event.preventDefault();

        var username = document.getElementById("newUsername").value.trim();
        var password = document.getElementById("newPassword").value.trim();
        var role = document.getElementById("newRole").value;

        if (username === "" || password === "") {
            alert("Vui lòng nhập đầy đủ!");
            return;
        }

        var users = getUsers();
        if (users[username]) {
            alert("Tài khoản đã tồn tại!");
            return;
        }

        users[username] = {
            password: password,
            role: role,
            createdAt: new Date().toLocaleString("vi-VN")
        };
        saveUsers(users);

        document.getElementById("newUsername").value = "";
        document.getElementById("newPassword").value = "";
        document.getElementById("newRole").value = "user";

        var successBox = document.getElementById("successMessage");
        successBox.style.display = "block";

        renderUserTable();
    }

    /************** XÓA TÀI KHOẢN **************/
    function deleteUser(username) {
        var current = getCurrentUser();
        if (username === current) {
            alert("Không được xóa tài khoản admin đang đăng nhập!");
            return;
        }

        var ok = confirm("Xóa tài khoản: " + username + " ?");
        if (!ok) return;

        var users = getUsers();
        delete users[username];
        saveUsers(users);
        renderUserTable();
    }

    /************** ĐĂNG XUẤT **************/
    function logout() {
        localStorage.removeItem("currentUser");
        window.location.href = "index.html";
    }

    /************** KHỞI TẠO **************/
    window.onload = function () {
        var admin = requireAdmin();
        if (!admin) return;

        var successBox = document.getElementById("successMessage");
        if (successBox) successBox.style.display = "none";
        // nút logout
        var logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) logoutBtn.onclick = logout;

        // form thêm tài khoản
        var form = document.getElementById("addUserForm");
        if (form) form.onsubmit = handleAddUser;

        renderUserTable();
    };

