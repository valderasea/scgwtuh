import { fileTypeFromBuffer } from "file-type";
import fetch from "node-fetch";
import { FormData, Blob } from "formdata-node";

const DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

export async function uploaderUguu(buffer) {
    try {
        if (!buffer || buffer.length === 0) throw new Error("Buffer kosong!");
        const type = await fileTypeFromBuffer(buffer);
        const formData = new FormData();
        const blob = new Blob([buffer], { type: type?.mime || "application/octet-stream" });
        formData.append("files[]", blob, `upload.${type?.ext || "bin"}`);

        const response = await fetch("https://uguu.se/upload.php", {
            method: "POST",
            headers: DEFAULT_HEADERS,
            body: formData,
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        return json.files[0].url.trim();
    } catch (e) {
        throw e;
    }
}