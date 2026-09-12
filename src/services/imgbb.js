const IMGBB_API_KEY = "83e3f88941efd1059a89f016ff302d9e";

/**
 * Uploads a single File or base64 Data URL to ImgBB.
 * Returns the hosted image URL string.
 */
export async function uploadImageToImgBB(fileOrDataUrl) {
  try {
    const formData = new FormData();

    if (typeof fileOrDataUrl === "string" && fileOrDataUrl.startsWith("data:")) {
      // Extract base64 part
      const base64Data = fileOrDataUrl.split(",")[1];
      formData.append("image", base64Data);
    } else if (fileOrDataUrl instanceof File || fileOrDataUrl instanceof Blob) {
      formData.append("image", fileOrDataUrl);
    } else {
      return fileOrDataUrl; // Already a URL string
    }

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (data && data.success && data.data && data.data.url) {
      return data.data.url;
    } else {
      console.warn("ImgBB upload returned non-success data, falling back:", data);
      return typeof fileOrDataUrl === "string" ? fileOrDataUrl : URL.createObjectURL(fileOrDataUrl);
    }
  } catch (err) {
    console.error("ImgBB upload error:", err);
    // Fallback: convert file to DataURL or object URL
    if (fileOrDataUrl instanceof File) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(fileOrDataUrl);
      });
    }
    return fileOrDataUrl;
  }
}

/**
 * Uploads multiple image files to ImgBB sequentially or in parallel.
 * Returns array of image URLs.
 */
export async function uploadMultipleImagesToImgBB(fileList) {
  if (!fileList || fileList.length === 0) return [];
  const filesArray = Array.from(fileList);
  const uploadPromises = filesArray.map((file) => uploadImageToImgBB(file));
  return await Promise.all(uploadPromises);
}
