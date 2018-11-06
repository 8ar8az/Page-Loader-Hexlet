export default class PageLoaderDownloadingError extends Error {
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, PageLoaderDownloadingError.prototype);
    this.name = this.constructor.name;
    this.message = message;

    Error.captureStackTrace(this, PageLoaderDownloadingError);
  }
}
