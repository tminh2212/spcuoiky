    /********** HÀM LẤY DỮ LIỆU localStorage **********/
    function getCurrentUser() {
        return localStorage.getItem("currentUser");
    }

    function getUsers() {
        var text = localStorage.getItem("users");
        if (text === null) {
            return {};
        }
        return JSON.parse(text);
    }

    function getContents() {
        var text = localStorage.getItem("contents");
        if (text === null) {
            return [];
        }
        return JSON.parse(text);
    }

    /********** CHỈ CHO ADMIN VÀO TRANG NÀY **********/
    function checkAdminLogin() {
        var currentUser = getCurrentUser();
        var users = getUsers();

        // Không có user hoặc không tồn tại
        if (currentUser === null ||
            users[currentUser] === undefined ||
            users[currentUser].role !== "admin") {

            alert("Bạn không có quyền truy cập trang thống kê này!");
            window.location.href = "login.html";
            return null;
        }
        return currentUser;
    }

    /********** TÍNH TOÁN VÀ HIỂN THỊ THỐNG KÊ **********/
    function renderStats(adminUser) {
        // Cập nhật dòng chào
        document.getElementById("welcomeText").textContent =
            "Xin chào, " + adminUser + "!";

        var users = getUsers();
        var contents = getContents();
        var username;
        var i;

        // Đếm tài khoản có role = user
        var totalUsers = 0;
        for (username in users) {
            if (users[username].role === "user") {
                totalUsers++;
            }
        }

        // Tổng số bài viết
        var totalPosts = contents.length;

        // Bài public + tổng likes + tổng comments
        var publicPosts = 0;
        var totalLikes = 0;
        var totalComments = 0;

        for (i = 0; i < contents.length; i++) {
            var c = contents[i];

            if (c.isPublic) {
                publicPosts++;
            }

            if (c.likes) {
                totalLikes += c.likes.length;
            }
            if (c.comments) {
                totalComments += c.comments.length;
            }
        }

        // Ghi số lên giao diện
        document.getElementById("totalUsers").textContent = totalUsers;
        document.getElementById("totalPosts").textContent = totalPosts;
        document.getElementById("publicPosts").textContent = publicPosts;
        document.getElementById("totalLikes").textContent = totalLikes;
        document.getElementById("totalComments").textContent = totalComments;
    }

    /********** UI: ĐĂNG XUẤT + CHUYỂN THEME **********/
    function setupUI() {
        // Đăng xuất
        document.getElementById("logoutBtn").onclick = function () {
            localStorage.removeItem("currentUser");
            window.location.href = "login.html";
        };

        // Chế độ sáng/tối
        var btn = document.getElementById("themeToggleStats");
        var isDark = false;

        function applyTheme() {
            if (isDark) {
                document.body.classList.remove("light-mode");
                btn.textContent = "Chế độ sáng";
            } else {
                document.body.classList.add("light-mode");
                btn.textContent = "Chế độ tối";
            }
        }

        btn.onclick = function () {
            isDark = !isDark;
            applyTheme();
        };

        applyTheme();
    }

    /********** HÀM CHẠY KHI LOAD TRANG **********/
    window.onload = function () {
        var admin = checkAdminLogin();
        if (admin === null) {
            return;
        }

        setupUI();
        renderStats(admin);
    };
