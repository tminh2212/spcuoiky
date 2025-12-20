/****************** LOCALSTORAGE ******************/

// Lấy danh sách người dùng từ localStorage
function layDanhSachNguoiDung() {
    var text = localStorage.getItem("danhsachnguoidung");
    if (!text) {
        return {};
    }
    return JSON.parse(text);
}

// Lưu danh sách người dùng
function luuDanhSachNguoiDung(dsNguoiDung) {
    localStorage.setItem("danhsachnguoidung", JSON.stringify(dsNguoiDung));
}

// Ghi nhớ tài khoản hiện đang đăng nhập
function luuNguoiDungHienTai(tendangnhap) {
    localStorage.setItem("nguoidunghientai", tendangnhap);
}


/****************** KHỞI TẠO TÀI KHOẢN ADMIN MẶC ĐỊNH ******************/

function khoiTaoAdminMacDinh() {
    var ds = layDanhSachNguoiDung();

    // Nếu chưa có tài khoản admin thì tạo mặc định
    if (!ds["admin"]) {
        ds["admin"] = {
            matkhau: "123",
            vaitro: "admin",
            ngaytao: new Date().toLocaleString("vi-VN")
        };
        luuDanhSachNguoiDung(ds);
    }
}


/****************** XỬ LÝ ĐĂNG KÝ ******************/

function xuLyDangKy(suKien) {
    suKien.preventDefault();
    
    // Lấy giá trị từ 2 ô input trong form đăng ký
    var tendn = document.getElementById("tendangnhapdk").value.trim();
    var mk    = document.getElementById("matkhaudangky").value.trim();

    // Lấy phần tử hiển thị thông báo
    var oThongBao = document.getElementById("tbDangKy");
    if (oThongBao) {
        oThongBao.textContent = ""; // xóa thông báo cũ mỗi lần bấm
    }

    // Kiểm tra rỗng
    if (tendn === "" || mk === "") {
        if (oThongBao) {
            oThongBao.textContent = "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!";
            oThongBao.className = "tb-dangky";
            oThongBao.style.color = "#D93025";
        }
        return;
    }

    // Kiểm tra trùng tên
    var ds = layDanhSachNguoiDung();

    if (ds[tendn]) {
        if (oThongBao) {
            oThongBao.textContent = "Tên đăng nhập đã tồn tại!";
            oThongBao.className = "tb-dangky";
            oThongBao.style.color = "#D93025";
        }
        return;
    }

    // Tạo tài khoản mới với role = user
    ds[tendn] = {
        matkhau: mk,
        vaitro: "user",
        ngaytao: new Date().toLocaleString("vi-VN")
    };

    // Lưu lại vào localStorage
    luuDanhSachNguoiDung(ds);

    // Hiện thông báo đăng ký thành công
    if (oThongBao) {
        oThongBao.textContent = "Đăng ký thành công! Chuyển sang đăng nhập...";
        oThongBao.className = "tb-dangky";
        oThongBao.style.color = "#34A853"; // xanh thành công
    }
    
    // Sau 1 giây tự động chuyển sang form đăng nhập
    setTimeout(function() {
        hienFormDangNhap();
    }, 1000);
}




/****************** TOGGLE GIỮA CÁC FORM ******************/

function hienFormDangNhap() {
    document.getElementById("formDangNhap").style.display = "flex";
    document.getElementById("formDangKy").style.display = "none";
    // Xóa các ô input
    document.getElementById("tendangnhap").value = "";
    document.getElementById("matkhaudangnhap").value = "";
    // Xóa thông báo
    var tb = document.getElementById("tbDangNhap");
    if (tb) tb.textContent = "";
}

function hienFormDangKy() {
    document.getElementById("formDangNhap").style.display = "none";
    document.getElementById("formDangKy").style.display = "flex";
    // Xóa các ô input
    document.getElementById("tendangnhapdk").value = "";
    document.getElementById("matkhaudangky").value = "";
    // Xóa thông báo
    var tb = document.getElementById("tbDangKy");
    if (tb) tb.textContent = "";
}

/****************** XỬ LÝ ĐĂNG NHẬP ******************/

function xuLyDangNhap(suKien) {
    suKien.preventDefault();

    var tendn = document.getElementById("tendangnhap").value.trim();
    var matkhau = document.getElementById("matkhaudangnhap").value.trim();

    var oThongBao = document.getElementById("tbDangNhap");
    if (oThongBao) {
        oThongBao.textContent = "";
        oThongBao.className = "tb-dangky";
    }

    if (tendn === "" || matkhau === "") {
        if (oThongBao) {
            oThongBao.textContent = "Vui lòng nhập đầy đủ thông tin!";
            oThongBao.style.color = "#D93025";
        }
        return;
    }

    var ds = layDanhSachNguoiDung();

    if (!ds[tendn]) {
        if (oThongBao) {
            oThongBao.textContent = "Tài khoản không tồn tại!";
            oThongBao.style.color = "#D93025";
        }
        return;
    }

    if (ds[tendn].matkhau !== matkhau) {
        if (oThongBao) {
            oThongBao.textContent = "Sai mật khẩu!";
            oThongBao.style.color = "#D93025";
        }
        return;
    }

    // Lưu tài khoản đang đăng nhập
    luuNguoiDungHienTai(tendn);

    // Điều hướng theo vai trò
    if (ds[tendn].vaitro === "admin") {
        window.location.href = "admin.html";
    } else {
        window.location.href = "user.html";
    }
}


/****************** KHỞI TẠO SỰ KIỆN ******************/

window.onload = function () {
    // Tạo admin mặc định nếu chưa có
    khoiTaoAdminMacDinh();

    // Form đăng nhập
    var formDN = document.getElementById("formdangnhap");
    if (formDN) {
        formDN.onsubmit = xuLyDangNhap;
    }

    // Form đăng ký
    var formDK = document.getElementById("formdangky");
    if (formDK) {
        formDK.onsubmit = xuLyDangKy;
    }

    // Link chuyển sang đăng ký
    var linkDK = document.getElementById("chuyenDangKy");
    if (linkDK) {
        linkDK.onclick = function(e) {
            e.preventDefault();
            hienFormDangKy();
        };
    }

    // Link chuyển sang đăng nhập
    var linkDN = document.getElementById("chuyenDangNhap");
    if (linkDN) {
        linkDN.onclick = function(e) {
            e.preventDefault();
            hienFormDangNhap();
        };
    }
};
