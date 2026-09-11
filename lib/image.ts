/**
 * Shrink a photo to at most `max` px on its long edge, as JPEG. Browser only.
 * Decodes through <img>, which applies the camera's EXIF rotation, so portrait
 * photos don't come out sideways. A JPEG that's already small enough is returned as is.
 */
export async function shrinkImage(blob: Blob, max = 1200): Promise<Blob> {
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    if (scale === 1 && blob.type === "image/jpeg") return blob;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode photo"))), "image/jpeg", 0.85));
  } finally {
    URL.revokeObjectURL(url);
  }
}
