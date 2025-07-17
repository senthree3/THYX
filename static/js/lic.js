document.addEventListener("DOMContentLoaded", function () {
    const statusSpan = document.getElementById("license-status");
    const uploadInput = document.getElementById("upload-license-input");
    const updateBtn = document.getElementById("update-license-btn");

    // 获取授权状态
    fetch("/admin/api/license/status/")
        .then(response => response.json())
        .then(data => {
            statusSpan.textContent = data.status_text;
            if (data.license_exists) {
                updateBtn.style.display = "inline-block";
            }
        });

    // 下载 KEY
    document.getElementById("download-key-btn").addEventListener("click", () => {
        window.location.href = "/admin/api/license/download_key/";
    });

    // 上传授权点击触发 file input
    document.getElementById("upload-license-btn").addEventListener("click", () => {
        uploadInput.click();
    });

    // 上传授权文件提交
    uploadInput.addEventListener("change", () => {
        const formData = new FormData();
        formData.append("license_file", uploadInput.files[0]);

        fetch("/admin/api/license/upload/", {
            method: "POST",
            body: formData
        }).then(res => res.json()).then(data => {
            alert(data.message);
            location.reload();
        });
    });

    // 更新授权（逻辑等同上传）
    updateBtn.addEventListener("click", () => {
        uploadInput.click();
    });
});
