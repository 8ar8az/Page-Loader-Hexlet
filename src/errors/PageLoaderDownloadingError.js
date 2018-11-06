import PageLoaderError from './PageLoaderError';

export default function PageLoaderDownloadingError(message) {
  PageLoaderError.call(this, message);
}

PageLoaderDownloadingError.prototype = Object.create(PageLoaderError.prototype);
PageLoaderDownloadingError.prototype.constructor = PageLoaderDownloadingError;
