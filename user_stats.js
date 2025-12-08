    function getCurrentUser() {
        return localStorage.getItem("currentUser");
    }

    function getUsers() {
        var text = localStorage.getItem("users");
        if (text === null) return {};
        return JSON.parse(text);
    }

    function getContents() {
        var text = localStorage.getItem("contents");
        if (text === null) return [];
        return JSON.parse(text);
    }

    function requireUser() {
        var current = getCurrentUser();
        var users = getUsers();
        if (!current || !users[current]) {
            alert("Bạn phải đăng nhập!");
            window.location.href = "index.html";
            return null;
        }
        if (users[current].role !== "user") {
            alert("Admin không xem trang này!");
            window.location.href = "admin.html";
            return null;
        }
        return current;
    }

    function renderUserStats(user) {
        var contents = getContents();
        var my = [];
        var i;

        for (i = 0; i < contents.length; i++) {
            if (contents[i].owner === user) my.push(contents[i]);
        }

        var totalMy = my.length;
        var publicMy = 0;
        var likes = 0;
        var comments = 0;
        var topicCount = {}; // { 'Chủ đề A': 3, ... }

        for (i = 0; i < my.length; i++) {
            var c = my[i];
            if (c.isPublic) publicMy++;
            if (c.likes) likes += c.likes.length;
            if (c.comments) comments += c.comments.length;

            var topic = c.topic || "Không có chủ đề";
            if (!topicCount[topic]) topicCount[topic] = 0;
            topicCount[topic]++;
        }

        document.getElementById("totalMy").textContent = totalMy;
        document.getElementById("myPublic").textContent = publicMy;
        document.getElementById("myPrivate").textContent = (totalMy - publicMy);
        document.getElementById("myLikes").textContent = likes;
        document.getElementById("myComments").textContent = comments;

        // thống kê theo chủ đề
        var ul = document.getElementById("topicList");
        ul.innerHTML = "";
        for (var t in topicCount) {
            var li = document.createElement("li");
            li.textContent = t + ": " + topicCount[t] + " bài";
            ul.appendChild(li);
        }
        if (ul.children.length === 0) {
            var liEmpty = document.createElement("li");
            liEmpty.textContent = "Chưa có dữ liệu";
            ul.appendChild(liEmpty);
        }
    }

    function logout() {
        localStorage.removeItem("currentUser");
        window.location.href = "index.html";
    }

    window.onload = function () {
        var u = requireUser();
        if (!u) return;

        var btnLogout = document.getElementById("logoutBtn");
        if (btnLogout) btnLogout.onclick = logout;

        renderUserStats(u);
    };

