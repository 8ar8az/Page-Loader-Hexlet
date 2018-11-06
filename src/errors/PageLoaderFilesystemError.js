import PageLoaderError from './PageLoaderError';

export default function PageLoaderFilesystemError(message) {
  PageLoaderError.call(this, message);
}

PageLoaderFilesystemError.prototype = Object.create(PageLoaderError.prototype);
PageLoaderFilesystemError.prototype.constructor = PageLoaderFilesystemError;
