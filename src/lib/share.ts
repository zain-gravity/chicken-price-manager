// ============================================================
// Web Share API Utility
// ============================================================

/**
 * Share a file using the Web Share API.
 * Falls back to downloading the file if sharing is not supported.
 */
export async function shareFile(
  blob: Blob,
  fileName: string,
  title: string
): Promise<boolean> {
  const file = new File([blob], fileName, { type: blob.type });

  // Check if Web Share API with file sharing is supported
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: title,
        text: `${title} - Daily Price List`,
        files: [file],
      });
      return true;
    } catch (error) {
      // User cancelled or share failed
      if ((error as Error).name === 'AbortError') {
        return false; // User cancelled, not an error
      }
      console.error('Share failed, falling back to download:', error);
    }
  }

  // Fallback: download the file
  downloadFile(blob, fileName);
  return true;
}

/**
 * Download a blob as a file.
 */
export function downloadFile(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate a standardized filename for exports.
 */
export function generateFileName(
  shopName: string,
  date: string,
  extension: 'pdf' | 'png'
): string {
  const sanitized = shopName
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 30);
  return `ChickenPrice_${sanitized}_${date}.${extension}`;
}
