    /************************************************************
     *  CÁC HÀM LÀM VIỆC VỚI localStorage
     *  - Lưu / lấy user đang đăng nhập
     *  - Lưu / lấy danh sách users
     *  - Lưu / lấy danh sách contents (bài viết)
     ************************************************************/

    // Lấy tên tài khoản đang đăng nhập
    function getCurrentUser() {
        // currentUser được lưu ở dạng chuỗi (username)
        return localStorage.getItem("currentUser");
    }

    // Lấy danh sách user từ localStorage
    function getUsers() {
        var text = localStorage.getItem("users");
        // Nếu chưa có dữ liệu thì trả về object rỗng
        if (text === null) {
            return {};
        }
        // Chuyển JSON string -> object
        return JSON.parse(text);
    }

    // Lấy mảng bài viết (contents) từ localStorage
    function getContents() {
        var text = localStorage.getItem("contents");
        // Nếu chưa có thì trả về mảng rỗng
        if (text === null) {
            return [];
        }
        return JSON.parse(text);
    }

    // Lưu lại mảng bài viết vào localStorage
    function saveContents(contents) {
        // Chuyển object/mảng -> chuỗi JSON
        var text = JSON.stringify(contents);
        localStorage.setItem("contents", text);
    }

    // Sinh ID tự tăng cho bài viết
    function getNextContentId() {
        var idText = localStorage.getItem("nextContentId");
        var id;
        if (idText === null) {
            // Nếu chưa có, bắt đầu từ 1
            id = 1;
        } else {
            // Chuyển chuỗi -> số
            id = Number(idText);
        }
        // Lưu lại ID cho lần sau
        localStorage.setItem("nextContentId", id + 1);
        return id;
    }

    /************************************************************
     *  KIỂM TRA ĐĂNG NHẬP USER
    *  - Nếu chưa đăng nhập: quay về trang login.html
     *  - Nếu là admin: chuyển sang admin.html
     ************************************************************/
    function checkUserLogin() {
        var currentUser = getCurrentUser();
        var users = getUsers();

        // Không có currentUser hoặc user không tồn tại
        if (currentUser === null || users[currentUser] === undefined) {
            alert("Bạn phải đăng nhập trước!");
            window.location.href = "login.html";
            return null; // báo lỗi
        }

        // Nếu role là admin thì không cho vào trang user
        if (users[currentUser].role === "admin") {
            alert("Đây là tài khoản admin, chuyển sang trang quản trị.");
            window.location.href = "admin.html";
            return null;
        }

        // Hợp lệ -> trả về username
        return currentUser;
    }

    /************************************************************
     *  BIẾN TOÀN CỤC
     ************************************************************/
    // Lưu username đang đăng nhập
    var CURRENT_USER = null;
    // Lưu id bài viết đang mở trong modal chi tiết
    var SELECTED_CONTENT_ID = null;

    /************************************************************
     *  HÀM XỬ LÝ FORM: THÊM / SỬA / XÓA NỘI DUNG
     ************************************************************/

    // Xóa toàn bộ dữ liệu trên form
    function resetForm() {
        document.getElementById("contentId").value = "";
        document.getElementById("title").value = "";
        document.getElementById("topic").value = "";
        document.getElementById("description").value = "";
        document.getElementById("visibility").value = "public";
        document.getElementById("content").value = "";
    }

    // Lưu nội dung: nếu có contentId => sửa, không có => thêm mới
    function saveContent() {
        // Lấy giá trị từ các ô nhập
        var idInput = document.getElementById("contentId").value;
        var title = document.getElementById("title").value.trim();
        var topic = document.getElementById("topic").value.trim();
        var description = document.getElementById("description").value.trim();
        var visibility = document.getElementById("visibility").value;
        var content = document.getElementById("content").value.trim();

        // Kiểm tra nhập đủ
        if (title === "" || topic === "" || description === "" || content === "") {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        var contents = getContents();
        var i;

        if (idInput !== "") {
            // ===== TRƯỜNG HỢP SỬA BÀI =====
            var id = Number(idInput);
            var foundIndex = -1;

            // Tìm bài có id trùng và owner là CURRENT_USER
            for (i = 0; i < contents.length; i++) {
                if (contents[i].id === id && contents[i].owner === CURRENT_USER) {
                    foundIndex = i;
                    break;
                }
            }

            if (foundIndex === -1) {
                alert("Không tìm thấy nội dung để sửa!");
                return;
            }

            // Cập nhật lại các thuộc tính
            contents[foundIndex].title = title;
            contents[foundIndex].topic = topic;
            contents[foundIndex].description = description;
            contents[foundIndex].content = content;
            contents[foundIndex].isPublic = (visibility === "public");

            alert("Cập nhật nội dung thành công!");
        } else {
            // ===== TRƯỜNG HỢP THÊM MỚI =====
            var newContent = {
                id: getNextContentId(),                 // id tự tăng
                title: title,                           // tiêu đề
                topic: topic,                           // chủ đề
                description: description,               // mô tả ngắn
                content: content,                       // nội dung chi tiết
                isPublic: (visibility === "public"),    // true/false
                owner: CURRENT_USER,                    // người tạo
                createdAt: new Date().toLocaleString("vi-VN"), // ngày tạo
                likes: [],                              // mảng username đã like
                comments: []                            // mảng comment
            };
            contents.push(newContent);
            alert("Thêm nội dung thành công!");
        }

        // Lưu lại và cập nhật danh sách
        saveContents(contents);
        resetForm();
        displayContents();
    }

    // Nạp dữ liệu 1 bài lên form để sửa
    function editContent(id) {
        var contents = getContents();
        var i;
        var item = null;

        // Tìm bài thuộc user hiện tại
        for (i = 0; i < contents.length; i++) {
            if (contents[i].id === id && contents[i].owner === CURRENT_USER) {
                item = contents[i];
                break;
            }
        }

        if (item === null) {
            alert("Không tìm thấy nội dung hoặc bạn không có quyền sửa!");
            return;
        }

        // Gán lại lên form
        document.getElementById("contentId").value = item.id;
        document.getElementById("title").value = item.title;
        document.getElementById("topic").value = item.topic;
        document.getElementById("description").value = item.description;
        document.getElementById("visibility").value = item.isPublic ? "public" : "private";
        document.getElementById("content").value = item.content;

        // Kéo lên đầu trang cho dễ sửa
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Xóa 1 bài viết
    function deleteContent(id) {
        var ok = confirm("Bạn có chắc muốn xóa nội dung này?");
        if (!ok) {
            return;
        }

        var contents = getContents();
        var i;
        var foundIndex = -1;

        // Tìm vị trí bài cần xóa
        for (i = 0; i < contents.length; i++) {
            if (contents[i].id === id && contents[i].owner === CURRENT_USER) {
                foundIndex = i;
                break;
            }
        }

        if (foundIndex === -1) {
            alert("Không tìm thấy nội dung hoặc bạn không có quyền xóa!");
            return;
        }

        // Xóa phần tử trong mảng
        contents.splice(foundIndex, 1);
        saveContents(contents);
        alert("Đã xóa nội dung!");

        // Render lại danh sách
        displayContents();

        // Nếu đang xem chi tiết bài này thì đóng modal
        if (SELECTED_CONTENT_ID === id) {
            closeModal();
        }
    }

    /************************************************************
     *  CÁC HÀM XỬ LÝ DANH SÁCH BÀI VIẾT (LIST BÊN PHẢI)
     ************************************************************/

    // Lấy các bài mà user nhìn thấy:
    //  - Bài của mình
    //  - Bài public của người khác
    function getVisibleContents() {
        var allContents = getContents();
        var result = [];
        var i;

        for (i = 0; i < allContents.length; i++) {
            var item = allContents[i];
            if (item.owner === CURRENT_USER || item.isPublic === true) {
                result.push(item);
            }
        }
        return result;
    }

    // Xây dựng danh sách chủ đề trong ô <select> lọc chủ đề
    function buildTopicFilterOptions(visibleContents) {
        var select = document.getElementById("topicFilter");
        // Lưu lại lựa chọn trước đó
        var oldValue = select.value || "all";

        // Mảng chủ đề (không trùng lặp)
        var topics = [];
        var i, j, exist;

        // Xóa toàn bộ option cũ
        select.innerHTML = "";

        // Option "Tất cả chủ đề"
        var optionAll = document.createElement("option");
        optionAll.value = "all";
        optionAll.text = "Tất cả chủ đề";
        select.appendChild(optionAll);

        // Duyệt các bài để lấy danh sách chủ đề
        for (i = 0; i < visibleContents.length; i++) {
            var topic = visibleContents[i].topic;
            if (topic === undefined || topic === null || topic === "") {
                continue;
            }

            // Kiểm tra topic đã tồn tại trong mảng topics chưa
            exist = false;
            for (j = 0; j < topics.length; j++) {
                if (topics[j] === topic) {
                    exist = true;
                    break;
                }
            }

            // Nếu chưa có thì thêm vào
            if (!exist) {
                topics.push(topic);
            }
        }

        // Thêm các option chủ đề
        for (i = 0; i < topics.length; i++) {
            var opt = document.createElement("option");
            opt.value = topics[i];
            opt.text = topics[i];
            select.appendChild(opt);
        }

        // Nếu lựa chọn cũ vẫn còn trong options thì giữ lại
        var k;
        var canKeep = false;
        for (k = 0; k < select.options.length; k++) {
            if (select.options[k].value === oldValue) {
                canKeep = true;
                break;
            }
        }
        if (canKeep) {
            select.value = oldValue;
        } else {
            select.value = "all";
        }
    }

    // Vẽ lại danh sách bài viết ở cột bên phải
    function displayContents() {
        var postList = document.getElementById("postList");
        var emptyMsg = document.getElementById("emptyMessage");
        postList.innerHTML = ""; // xóa toàn bộ cũ

        // Lấy danh sách bài user được phép xem
        var visibleContents = getVisibleContents();

        // Cập nhật danh sách chủ đề trong ô select
        buildTopicFilterOptions(visibleContents);

        // Lấy text tìm kiếm và chủ đề chọn
        var searchText = document.getElementById("searchInput").value.trim().toLowerCase();
        var topicFilter = document.getElementById("topicFilter").value;

        // Mảng kết quả sau khi lọc
        var result = [];
        var i;

        // Lọc bài theo tiêu đề + chủ đề
        for (i = 0; i < visibleContents.length; i++) {
            var item = visibleContents[i];

            var matchSearch = item.title.toLowerCase().indexOf(searchText) !== -1;
            var matchTopic = (topicFilter === "all") || (item.topic === topicFilter);

            if (matchSearch && matchTopic) {
                result.push(item);
            }
        }

        // Nếu không có bài: hiện dòng "Chưa có bài viết"
        if (result.length === 0) {
            emptyMsg.style.display = "block";
            return;
        } else {
            emptyMsg.style.display = "none";
        }

        // Duyệt mảng kết quả để vẽ từng card bài viết
        for (i = 0; i < result.length; i++) {
            var c = result[i];

            // Tạo thẻ bao ngoài
            var card = document.createElement("div");
            card.className = "post-item";

            // ----- HEADER: tiêu đề + chủ sở hữu -----
            var header = document.createElement("div");
            header.className = "post-header";

            var titleEl = document.createElement("h3");
            titleEl.className = "post-title";
            titleEl.textContent = c.title;
            header.appendChild(titleEl);

            var ownerSpan = document.createElement("span");
            ownerSpan.className = "post-owner";
            ownerSpan.textContent = c.owner;
            header.appendChild(ownerSpan);

            card.appendChild(header);

            // ----- Mô tả ngắn -----
            var desc = document.createElement("p");
            desc.className = "post-description";
            desc.textContent = c.description;
            card.appendChild(desc);

            // ----- Dòng meta: chủ đề • ngày • trạng thái -----
            var meta = document.createElement("p");
            meta.className = "post-meta";

            var topicSpan = document.createElement("span");
            topicSpan.className = "post-topic";
            topicSpan.textContent = "Chủ đề: " + c.topic;

            var dateSpan = document.createElement("span");
            dateSpan.className = "post-date";
            dateSpan.textContent = c.createdAt;

            var statusSpan = document.createElement("span");
            statusSpan.className = "status-pill";
            if (c.isPublic) {
                statusSpan.className += " status-public";
                statusSpan.textContent = "Công khai";
            } else {
                statusSpan.className += " status-private";
                statusSpan.textContent = "Riêng tư";
            }

            // Ghép các phần tử vào meta
            meta.appendChild(topicSpan);
            meta.appendChild(document.createTextNode(" • "));
            meta.appendChild(dateSpan);
            meta.appendChild(document.createTextNode(" • "));
            meta.appendChild(statusSpan);

            card.appendChild(meta);

            // ----- FOOTER: like/bình luận + nút -----
            var footer = document.createElement("div");
            footer.className = "post-footer";

            // Thông tin like / comment
            var stats = document.createElement("div");
            stats.className = "post-stats";

            var likeCount = 0;
            if (c.likes !== undefined && c.likes !== null) {
                likeCount = c.likes.length;
            }
            var commentCount = 0;
            if (c.comments !== undefined && c.comments !== null) {
                commentCount = c.comments.length;
            }

            stats.innerHTML =
                '<span class="icon-heart">❤</span> ' + likeCount +
                '  <span class="icon-comment">💬</span> ' + commentCount;

            footer.appendChild(stats);

            // Nhóm nút hành động
            var actions = document.createElement("div");
            actions.className = "post-actions";

            // Nút "Xem chi tiết"
            var viewBtn = document.createElement("button");
            viewBtn.className = "btn-pill";
            viewBtn.textContent = "Xem chi tiết";
            // Dùng IIFE để truyền tham số id
            viewBtn.onclick = (function (id) {
                return function () {
                    viewDetail(id);
                };
            })(c.id);
            actions.appendChild(viewBtn);

            // Nếu là bài của mình: thêm nút Sửa + Xóa
            if (c.owner === CURRENT_USER) {
                var editBtn = document.createElement("button");
                editBtn.className = "btn-pill";
                editBtn.textContent = "Sửa";
                editBtn.onclick = (function (id) {
                    return function () {
                        editContent(id);
                    };
                })(c.id);
                actions.appendChild(editBtn);

                var delBtn = document.createElement("button");
                delBtn.className = "btn-pill btn-danger";
                delBtn.textContent = "Xóa";
                delBtn.onclick = (function (id) {
                    return function () {
                        deleteContent(id);
                    };
                })(c.id);
                actions.appendChild(delBtn);
            }

            footer.appendChild(actions);
            card.appendChild(footer);

            postList.appendChild(card);
        }
    }

    /************************************************************
     *  MODAL XEM CHI TIẾT + LIKE + BÌNH LUẬN
     ************************************************************/

    // Mở modal chi tiết (thêm class .show)
    function openModal() {
        var overlay = document.getElementById("detailModal");
        overlay.classList.add("show");
    }

    // Đóng modal chi tiết
    function closeModal() {
        var overlay = document.getElementById("detailModal");
        overlay.classList.remove("show");
        document.getElementById("commentText").value = "";
        SELECTED_CONTENT_ID = null;
    }

    // Hiển thị nội dung chi tiết của 1 bài trong modal
    function viewDetail(id) {
        var contents = getContents();
        var item = null;
        var i;

        // Tìm bài có id tương ứng
        for (i = 0; i < contents.length; i++) {
            if (contents[i].id === id) {
                item = contents[i];
                break;
            }
        }
        if (item === null) {
            alert("Không tìm thấy nội dung!");
            return;
        }

        SELECTED_CONTENT_ID = id;

        // Tiêu đề
        document.getElementById("modalTitle").textContent = item.title;

        // Dòng thông tin: owner • ngày • trạng thái • chủ đề
        var metaText = item.owner + " • " + item.createdAt + " • " +
            (item.isPublic ? "Công khai" : "Riêng tư") + " • Chủ đề: " + item.topic;
        document.getElementById("modalMeta").textContent = metaText;

        // Nội dung chi tiết (cho phép HTML đơn giản)
        document.getElementById("modalContent").innerHTML = item.content;

        // --------- Xử lý nút Like trong modal ----------
        var likeList = item.likes || [];
        var liked = false;
        for (i = 0; i < likeList.length; i++) {
            if (likeList[i] === CURRENT_USER) {
                liked = true;
                break;
            }
        }

        var likeBtn = document.getElementById("modalLikeBtn");
        if (liked) {
            likeBtn.textContent = "Bỏ thích";
        } else {
            likeBtn.textContent = "Thích";
        }
        document.getElementById("modalLikeInfo").textContent =
            likeList.length + " lượt thích";

        // --------- Danh sách bình luận ----------
        var ul = document.getElementById("commentList");
        ul.innerHTML = "";
        var comments = item.comments || [];
        for (i = 0; i < comments.length; i++) {
            var cmt = comments[i];
            var li = document.createElement("li");
            li.className = "comment-item";
            li.textContent = cmt.user + " (" + cmt.createdAt + "): " + cmt.text;
            ul.appendChild(li);
        }

        // --------- Quyền bình luận ----------
        var cmtWrapper = document.getElementById("commentFormWrapper");
        var cmtNote = document.getElementById("commentNote");
        if (!item.isPublic) {
            cmtWrapper.style.display = "none";
            cmtNote.textContent = "Đây là bài viết riêng tư, không thể bình luận.";
        } else if (item.owner === CURRENT_USER) {
            cmtWrapper.style.display = "none";
            cmtNote.textContent = "Bạn không thể bình luận vào bài viết của chính mình.";
        } else {
            cmtWrapper.style.display = "block";
            cmtNote.textContent = "";
        }

        openModal();
    }

    // Xử lý nhấn nút Thích / Bỏ thích trong modal
    function toggleLike() {
        if (SELECTED_CONTENT_ID === null) {
            return;
        }

        var contents = getContents();
        var item = null;
        var i;

        for (i = 0; i < contents.length; i++) {
            if (contents[i].id === SELECTED_CONTENT_ID) {
                item = contents[i];
                break;
            }
        }
        if (item === null) {
            return;
        }

        // Không cho tự like bài của mình
        if (item.owner === CURRENT_USER) {
            alert("Bạn không thể like bài của chính mình!");
            return;
        }
        // Bài private không cho like
        if (!item.isPublic) {
            alert("Chỉ có thể like bài công khai!");
            return;
        }

        if (!item.likes) {
            item.likes = [];
        }

        // Kiểm tra đã like chưa
        var index = -1;
        for (i = 0; i < item.likes.length; i++) {
            if (item.likes[i] === CURRENT_USER) {
                index = i;
                break;
            }
        }

        if (index === -1) {
            // Chưa like -> thêm vào mảng
            item.likes.push(CURRENT_USER);
        } else {
            // Đã like -> xóa khỏi mảng (bỏ thích)
            item.likes.splice(index, 1);
        }

        saveContents(contents);
        displayContents();                // cập nhật card bên ngoài
        viewDetail(SELECTED_CONTENT_ID);  // cập nhật lại modal
    }

    // Gửi bình luận mới cho bài đang mở
    function sendComment() {
        if (SELECTED_CONTENT_ID === null) {
            alert("Vui lòng chọn một nội dung để bình luận!");
            return;
        }

        var text = document.getElementById("commentText").value.trim();
        if (text === "") {
            alert("Vui lòng nhập nội dung bình luận!");
            return;
        }

        var contents = getContents();
        var item = null;
        var i;

        for (i = 0; i < contents.length; i++) {
            if (contents[i].id === SELECTED_CONTENT_ID) {
                item = contents[i];
                break;
            }
        }
        if (item === null) {
            return;
        }

        // Chỉ được bình luận bài public của người khác
        if (!item.isPublic || item.owner === CURRENT_USER) {
            alert("Bạn chỉ được bình luận vào bài công khai của người khác!");
            return;
        }

        if (!item.comments) {
            item.comments = [];
        }

        var newComment = {
            user: CURRENT_USER,
            text: text,
            createdAt: new Date().toLocaleString("vi-VN")
        };
        item.comments.push(newComment);

        saveContents(contents);
        document.getElementById("commentText").value = "";
        displayContents();                // cập nhật số comment ở card
        viewDetail(SELECTED_CONTENT_ID);  // hiển thị lại list comment
    }

    /************************************************************
     *  GIAO DIỆN: ĐĂNG XUẤT + CHUYỂN THEME
     ************************************************************/
    function setupUI() {
        // Dòng chữ "Xin chào, ..."
        document.getElementById("welcomeText").textContent =
            "Xin chào, " + CURRENT_USER + "!";

        // Nút đăng xuất: xóa currentUser và quay về trang đăng nhập
        document.getElementById("logoutBtn").onclick = function () {
            localStorage.removeItem("currentUser");
            window.location.href = "login.html";
        };

        // Nút chuyển chế độ tối/sáng
        var themeBtn = document.getElementById("themeToggleUser");
        var isDark = false; // false = sáng, true = tối

        function applyTheme() {
            if (isDark) {
                document.body.classList.remove("light-mode");
                themeBtn.textContent = "Chế độ sáng";
            } else {
                document.body.classList.add("light-mode");
                themeBtn.textContent = "Chế độ tối";
            }
        }

        themeBtn.onclick = function () {
            isDark = !isDark; // đảo trạng thái
            applyTheme();
        };

        applyTheme();
    }

    /************************************************************
     *  HÀM KHỞI TẠO KHI TẢI TRANG
     ************************************************************/
    window.onload = function () {
        // Bước 1: kiểm tra đăng nhập
        var user = checkUserLogin();
        if (user === null) {
            return;
        }
        CURRENT_USER = user;

        // Bước 2: setup các phần giao diện
        setupUI();

        // Bước 3: hiển thị danh sách bài viết lần đầu
        displayContents();

        // Gán sự kiện cho các nút và input
        document.getElementById("saveBtn").onclick = saveContent;
        document.getElementById("resetBtn").onclick = resetForm;

        document.getElementById("searchInput").oninput = displayContents;
        document.getElementById("topicFilter").onchange = displayContents;

        document.getElementById("modalCloseBtn").onclick = closeModal;
        document.getElementById("detailModal").onclick = function (e) {
            // Nhấn ra ngoài vùng modal -> đóng
            if (e.target.id === "detailModal") {
                closeModal();
            }
        };

        document.getElementById("modalLikeBtn").onclick = toggleLike;
        document.getElementById("commentBtn").onclick = sendComment;
    };
