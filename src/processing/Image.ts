export function domLoadImageAsync(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    let image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (e) => reject(e);
    image.crossOrigin = "Anonymous";
    image.src = source;
  });
}
