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

    /********** CHỈ CHO USER (KHÔNG PHẢI ADMIN) VÀO TRANG NÀY **********/
    function checkUserLogin() {
        var currentUser = getCurrentUser();
        var users = getUsers();

        if (currentUser === null || users[currentUser] === undefined) {
            alert("Bạn phải đăng nhập trước!");
            window.location.href = "login.html";
            return null;
        }

        if (users[currentUser].role === "admin") {
            alert("Tài khoản admin không dùng trang thống kê này!");
            window.location.href = "admin.html";
            return null;
        }

        return currentUser;
    }

    /********** TÍNH TOÁN THỐNG KÊ RIÊNG CHO USER **********/
    function renderStats(user) {
        // Dòng xin chào
        document.getElementById("welcomeText").textContent =
            "Xin chào, " + user + "!";

        var contents = getContents();
        var myContents = [];
        var i;

        // Lọc ra những bài có owner = user hiện tại
        for (i = 0; i < contents.length; i++) {
            if (contents[i].owner === user) {
                myContents.push(contents[i]);
            }
        }

        var totalMy = myContents.length;
        var myPublic = 0;
        var likes = 0;
        var comments = 0;

        // Đếm bài public, tổng likes, tổng comments
        for (i = 0; i < myContents.length; i++) {
            var c = myContents[i];

            if (c.isPublic) {
                myPublic++;
            }

            if (c.likes) {
                likes += c.likes.length;
            }
            if (c.comments) {
                comments += c.comments.length;
            }
        }

        var myPrivate = totalMy - myPublic;

        document.getElementById("totalMy").textContent = totalMy;
        document.getElementById("myPublic").textContent = myPublic;
        document.getElementById("myPrivate").textContent = myPrivate;
        document.getElementById("likesReceived").textContent = likes;
        document.getElementById("commentsReceived").textContent = comments;

        // Thống kê theo chủ đề
        var topicCounter = {}; // { 'CN1': 2, 'CN2': 3, ... }

        for (i = 0; i < myContents.length; i++) {
            var topic = myContents[i].topic;
            if (topic === undefined || topic === null || topic === "") {
                topic = "Không có chủ đề";
            }

            if (topicCounter[topic] === undefined) {
                topicCounter[topic] = 1;
            } else {
                topicCounter[topic] = topicCounter[topic] + 1;
            }
        }

        // Hiển thị ra <ul>
        var ul = document.getElementById("topicList");
        ul.innerHTML = "";

        var hasTopic = false;
        var key;
        for (key in topicCounter) {
            hasTopic = true;
            var li = document.createElement("li");
            li.textContent = key + ": " + topicCounter[key] + " bài";
            ul.appendChild(li);
        }

        if (!hasTopic) {
            var liEmpty = document.createElement("li");
            liEmpty.textContent = "Chưa có dữ liệu";
            ul.appendChild(liEmpty);
        }
    }

    /********** UI: ĐĂNG XUẤT + CHUYỂN THEME **********/
    function setupUI() {
        document.getElementById("logoutBtn").onclick = function () {
            localStorage.removeItem("currentUser");
            window.location.href = "login.html";
        };

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
        var user = checkUserLogin();
        if (user === null) {
            return;
        }

        setupUI();
        renderStats(user);
    };