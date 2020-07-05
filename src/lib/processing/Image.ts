export function domLoadImageAsync(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (e) => reject(e);
    image.crossOrigin = undefined; // "anonymous";
    image.src = source;
  });
}
