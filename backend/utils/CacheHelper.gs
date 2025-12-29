/**
 * Gets cached data if available
 * @param {string} key - Cache key
 * @return {*} Cached data or null
 */
function getCachedData(key) {
  try {
    const cache = CacheService.getScriptCache();
    const cached = cache.get(key);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    return null;
  } catch (error) {
    Logger.log('Error getting cached data: ' + error.toString());
    return null;
  }
}

/**
 * Stores data in cache
 * @param {string} key - Cache key
 * @param {*} data - Data to cache
 * @param {number} expirationInSeconds - Cache duration (optional)
 */
function setCachedData(key, data, expirationInSeconds) {
  try {
    const cache = CacheService.getScriptCache();
    const expiration = expirationInSeconds || CACHE_DURATION_SECONDS;
    cache.put(key, JSON.stringify(data), expiration);
  } catch (error) {
    Logger.log('Error setting cached data: ' + error.toString());
  }
}

/**
 * Generates cache key for product search
 * @param {string} query - Search query
 * @return {string} Cache key
 */
function generateSearchCacheKey(query) {
  return 'search_' + query.toLowerCase().trim();
}
