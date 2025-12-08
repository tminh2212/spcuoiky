/************** HỖ TRỢ USERS & CONTENTS **************/
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

function saveContents(list) {
    localStorage.setItem("contents", JSON.stringify(list));
}

function getNextContentId() {
    var idText = localStorage.getItem("nextContentId");
    var id = idText ? parseInt(idText) : 1;
    localStorage.setItem("nextContentId", id + 1);
    return id;
}

function requireUser() {
    var current = getCurrentUser();
    var users = getUsers();
    if (!current || !users[current]) {
        alert("Bạn phải đăng nhập!");
        window.location.href = "index.html";
        return null;
    }
    return current;
}

var CURRENT_USER = null;
var SELECTED_ID = null;

/************** HIỂN THỊ DANH SÁCH NỘI DUNG **************/
function renderContents() {
    var listEl = document.getElementById("postList");
    var emptyEl = document.getElementById("emptyMessage");
    listEl.innerHTML = "";

    var all = getContents();
    var visible = [];
    var i;

    for (i = 0; i < all.length; i++) {
        var c = all[i];
        if (c.owner === CURRENT_USER || c.isPublic === true) {
            visible.push(c);
        }
    }

    if (visible.length === 0) {
        if (emptyEl) emptyEl.style.display = "block";
        return;
    } else {
        if (emptyEl) emptyEl.style.display = "none";
    }

    for (i = 0; i < visible.length; i++) {
        var c = visible[i];

        var card = document.createElement("div");
        card.className = "post-item"; // khớp .post-item trong CSS

        // Tiêu đề bài + owner
        var h = document.createElement("h3");
        h.textContent = c.title;
        card.appendChild(h);

        // Dòng info: chủ đề + ngày
        var info = document.createElement("p");
        info.className = "post-info"; // ăn style .post-info
        info.textContent =
            "Chủ đề: " + c.topic +
            " • Ngày: " + (c.createdAt || "");
        card.appendChild(info);

        // Badge trạng thái Công khai / Riêng tư
        var badge = document.createElement("span");
        badge.className = "badge-status"; // .badge-status trong CSS
        badge.textContent = c.isPublic ? "Công khai" : "Riêng tư";
        card.appendChild(badge);

        // Mô tả ngắn
        if (c.description) {
            var desc = document.createElement("p");
            desc.textContent = c.description;
            card.appendChild(desc);
        }

        // Footer: hiển thị lượt like & bình luận
        var footer = document.createElement("div");
        footer.className = "post-footer"; // .post-footer trong CSS

        var likeCount = (c.likes && c.likes.length) ? c.likes.length : 0;
        var commentCount = (c.comments && c.comments.length) ? c.comments.length : 0;

        var spanLike = document.createElement("span");
        spanLike.textContent = "♥ " + likeCount;
        footer.appendChild(spanLike);

        var spanCmt = document.createElement("span");
        spanCmt.textContent = "💬 " + commentCount;
        footer.appendChild(spanCmt);

        card.appendChild(footer);

        // Hàng nút hành động (căn phải)
        var actions = document.createElement("div");
        actions.className = "post-actions"; // .post-actions trong CSS

        // Nút Xem chi tiết
        var btnView = document.createElement("button");
        btnView.textContent = "Xem chi tiết";
        btnView.className = "btn-pill"; // nút tròn trắng
        btnView.onclick = (function (id) {
            return function () {
                showDetail(id);
            };
        })(c.id);
        actions.appendChild(btnView);

        // Nút Sửa + Xóa 
        if (c.owner === CURRENT_USER) {
            var btnEdit = document.createElement("button");
            btnEdit.textContent = "Sửa";
            btnEdit.className = "btn-pill";
            btnEdit.onclick = (function (id) {
                return function () {
                    loadToForm(id);
                };
            })(c.id);
            actions.appendChild(btnEdit);

            var btnDel = document.createElement("button");
            btnDel.textContent = "Xóa";
            btnDel.className = "btn-pill btn-delete"; // viền đỏ chữ đỏ
            btnDel.onclick = (function (id) {
                return function () {
                    deleteContent(id);
                };
            })(c.id);
            actions.appendChild(btnDel);
        }

        card.appendChild(actions);
        listEl.appendChild(card);
    }
}

/************** THÊM / SỬA / XÓA NỘI DUNG **************/
function clearForm() {
    document.getElementById("contentId").value = "";
    document.getElementById("title").value = "";
    document.getElementById("topic").value = "";
    document.getElementById("description").value = "";
    document.getElementById("content").value = "";
    document.getElementById("visibility").value = "public";
}

function saveContent() {
    var idText = document.getElementById("contentId").value;
    var title = document.getElementById("title").value.trim();
    var topic = document.getElementById("topic").value.trim();
    var description = document.getElementById("description").value.trim();
    var contentText = document.getElementById("content").value.trim();
    var visibility = document.getElementById("visibility").value;

    if (title === "" || topic === "" || contentText === "") {
        alert("Vui lòng nhập đủ thông tin!");
        return;
    }

    var list = getContents();
    var i;

    if (idText !== "") {
        var id = parseInt(idText);
        for (i = 0; i < list.length; i++) {
            if (list[i].id === id && list[i].owner === CURRENT_USER) {
                list[i].title = title;
                list[i].topic = topic;
                list[i].description = description;
                list[i].content = contentText;
                list[i].isPublic = (visibility === "public");
                break;
            }
        }
    } else {
        var obj = {
            id: getNextContentId(),
            title: title,
            topic: topic,
            description: description,
            content: contentText,
            isPublic: (visibility === "public"),
            owner: CURRENT_USER,
            createdAt: new Date().toLocaleString("vi-VN"),
            likes: [],
            comments: []
        };
        list.push(obj);
    }

    saveContents(list);
    clearForm();
    renderContents();
}

function loadToForm(id) {
    var list = getContents();
    var i;
    for (i = 0; i < list.length; i++) {
        var c = list[i];
        if (c.id === id && c.owner === CURRENT_USER) {
            document.getElementById("contentId").value = c.id;
            document.getElementById("title").value = c.title;
            document.getElementById("topic").value = c.topic;
            document.getElementById("description").value = c.description || "";
            document.getElementById("content").value = c.content || "";
            document.getElementById("visibility").value = c.isPublic ? "public" : "private";
            break;
        }
    }
}

function deleteContent(id) {
    var ok = confirm("Xóa nội dung này?");
    if (!ok) return;

    var list = getContents();
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].id === id && list[i].owner === CURRENT_USER) {
            list.splice(i, 1);
            break;
        }
    }
    saveContents(list);
    renderContents();
}

/************** XEM CHI TIẾT + LIKE + BÌNH LUẬN **************/
function showDetail(id) {
    var list = getContents();
    var i, item = null;
    for (i = 0; i < list.length; i++) {
        if (list[i].id === id) {
            item = list[i];
            break;
        }
    }
    if (!item) return;

    SELECTED_ID = id;
    var box = document.getElementById("detailBox");
    if (!box) return;

    var html = "";
    html += "<h3>" + item.title + "</h3>";
    html += "<p>Chủ đề: " + item.topic + "</p>";
    html += "<p>Ngày tạo: " + (item.createdAt || "") + "</p>";
    html += "<p>Trạng thái: " + (item.isPublic ? "Công khai" : "Riêng tư") + "</p>";
    html += "<div class='detail-content'>" + item.content + "</div>";

    var likeCount = item.likes ? item.likes.length : 0;
    html += "<p>Lượt like: " + likeCount + "</p>";
    html += "<button id='btnLikeDetail' class='btn-pill'>Like</button>";

    html += "<h4>Bình luận</h4>";
    if (!item.comments) item.comments = [];
    html += "<ul>";
    for (i = 0; i < item.comments.length; i++) {
        var cmt = item.comments[i];
        html += "<li>" + cmt.user + " (" + cmt.createdAt + "): " + cmt.text + "</li>";
    }
    html += "</ul>";

    if (item.isPublic && item.owner !== CURRENT_USER) {
        html += "<textarea id='commentText' rows='2' cols='40' placeholder='Nhập bình luận...'></textarea><br>";
        html += "<button id='btnSendComment' class='btn-primary'>Gửi bình luận</button>";
    } else {
        html += "<p><i>Chỉ được bình luận bài công khai của người khác.</i></p>";
    }

    box.innerHTML = html;

    var btnLike = document.getElementById("btnLikeDetail");
    if (btnLike) btnLike.onclick = toggleLike;

    var btnSend = document.getElementById("btnSendComment");
    if (btnSend) btnSend.onclick = sendComment;
}

function toggleLike() {
    if (!SELECTED_ID) return;

    var list = getContents();
    var i, item = null;
    for (i = 0; i < list.length; i++) {
        if (list[i].id === SELECTED_ID) {
            item = list[i];
            break;
        }
    }
    if (!item) return;

    if (item.owner === CURRENT_USER) {
        alert("Không được like bài của chính mình!");
        return;
    }
    if (!item.isPublic) {
        alert("Chỉ like được bài công khai!");
        return;
    }

    if (!item.likes) item.likes = [];
    var idx = item.likes.indexOf(CURRENT_USER);
    if (idx === -1) item.likes.push(CURRENT_USER);
    else item.likes.splice(idx, 1);

    saveContents(list);
    showDetail(SELECTED_ID);
    renderContents();
}

function sendComment() {
    if (!SELECTED_ID) return;
    var textEl = document.getElementById("commentText");
    if (!textEl) return;

    var text = textEl.value.trim();
    if (text === "") {
        alert("Vui lòng nhập bình luận!");
        return;
    }

    var list = getContents();
    var i, item = null;
    for (i = 0; i < list.length; i++) {
        if (list[i].id === SELECTED_ID) {
            item = list[i];
            break;
        }
    }
    if (!item) return;

    if (!item.isPublic || item.owner === CURRENT_USER) {
        alert("Chỉ bình luận bài công khai của người khác!");
        return;
    }

    if (!item.comments) item.comments = [];
    item.comments.push({
        user: CURRENT_USER,
        text: text,
        createdAt: new Date().toLocaleString("vi-VN")
    });

    saveContents(list);
    showDetail(SELECTED_ID);
    renderContents();
}

/************** ĐĂNG XUẤT **************/
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

/************** KHỞI TẠO **************/
window.onload = function () {
    var u = requireUser();
    if (!u) return;
    CURRENT_USER = u;

    var btnLogout = document.getElementById("logoutBtn");
    if (btnLogout) btnLogout.onclick = logout;

    var btnSave = document.getElementById("saveBtn");
    if (btnSave) btnSave.onclick = saveContent;

    var btnReset = document.getElementById("resetBtn");
    if (btnReset) btnReset.onclick = clearForm;

    renderContents();
};
