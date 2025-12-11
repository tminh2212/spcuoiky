/****************** HỖ TRỢ LOCALSTORAGE ******************/

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


/****************** KHỞI TẠO ADMIN MẶC ĐỊNH ******************/

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

function xuLyDangKy() {
    // Lấy giá trị từ 2 ô input trong form
    var tendn = document.getElementById("tendangnhap").value.trim();
    var mk    = document.getElementById("matkhaudangnhap").value.trim();

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
            oThongBao.style.color = "#D93025"; // đỏ lỗi
        }
        return;
    }

    // Lấy danh sách người dùng từ localStorage
    var ds = layDanhSachNguoiDung();

    // Kiểm tra trùng tên
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

    // Hiện thông báo đăng ký thành công ngay dưới form
    if (oThongBao) {
        oThongBao.textContent = "Đăng ký thành công! Bạn có thể đăng nhập.";
        oThongBao.className = "tb-dangky";
        oThongBao.style.color = "#34A853"; // xanh thành công
    }
}




/****************** XỬ LÝ ĐĂNG NHẬP ******************/

function xuLyDangNhap(suKien) {
    suKien.preventDefault();

    var tendn = document.getElementById("tendangnhap").value.trim();
    var matkhau = document.getElementById("matkhaudangnhap").value.trim();

    var oThongBao = document.getElementById("tbDangKy");
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
    var form = document.getElementById("formdangnhap");
    if (form) {
        form.onsubmit = xuLyDangNhap;
    }

    // Nút đăng ký
    var nutDK = document.getElementById("nutdangky");
    if (nutDK) {
        nutDK.onclick = xuLyDangKy;
    }
};
