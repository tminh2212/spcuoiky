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

    function renderAdminStats() {
        var users = getUsers();
        var contents = getContents();

        var totalUser = 0;
        var username;
        for (username in users) {
            if (users[username].role === "user") totalUser++;
        }

        var totalContent = contents.length;
        var totalPublic = 0;
        var totalLikes = 0;
        var totalComments = 0;

        var i;
        for (i = 0; i < contents.length; i++) {
            var c = contents[i];
            if (c.isPublic) totalPublic++;
            if (c.likes) totalLikes += c.likes.length;
            if (c.comments) totalComments += c.comments.length;
        }

        document.getElementById("totalUsers").textContent = totalUser;
        document.getElementById("totalContents").textContent = totalContent;
        document.getElementById("totalPublic").textContent = totalPublic;
        document.getElementById("totalLikes").textContent = totalLikes;
        document.getElementById("totalComments").textContent = totalComments;
    }

    function logout() {
        localStorage.removeItem("currentUser");
        window.location.href = "index.html";
    }

    window.onload = function () {
        var a = requireAdmin();
        if (!a) return;

        var btnLogout = document.getElementById("logoutBtn");
        if (btnLogout) btnLogout.onclick = logout;

        renderAdminStats();
    };

