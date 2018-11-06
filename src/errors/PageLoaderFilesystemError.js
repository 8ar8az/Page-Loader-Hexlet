export default class PageLoaderFilesystemError extends Error {
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, PageLoaderFilesystemError.prototype);
    this.name = this.constructor.name;
    this.message = message;

    Error.captureStackTrace(this, PageLoaderFilesystemError);
  }
}
