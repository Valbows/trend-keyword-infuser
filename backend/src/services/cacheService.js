const cache = new Map();

/**
 * Sets a value in the cache with a Time-to-Live (TTL).
 * @param {string} key - The cache key.
 * @param {any} value - The value to store.
 * @param {number} ttl - The TTL in milliseconds.
 */
const set = (key, value, ttl) => {
  const expires = Date.now() + ttl;
  cache.set(key, { value, expires });
};

/**
 * Gets a value from the cache.
 * Returns the value if the key exists and has not expired, otherwise null.
 * @param {string} key - The cache key.
 * @returns {any|null}
 */
const get = (key) => {
  const data = cache.get(key);
  if (!data) {
    return null;
  }

  if (Date.now() > data.expires) {
    cache.delete(key); // Clean up expired entry
    return null;
  }

  return data.value;
};

/**
 * Clears the entire cache.
 */
const clear = () => {
  cache.clear();
};

module.exports = {
  get,
  set,
  clear,
};
