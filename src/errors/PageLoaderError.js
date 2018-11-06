export default function PageLoaderError(message) {
  Error.call(this, message);

  this.name = this.constructor.name;
  Error.captureStackTrace(this, this.constructor);
}

PageLoaderError.prototype = Object.create(Error.prototype);
PageLoaderError.prototype.constructor = PageLoaderError;
