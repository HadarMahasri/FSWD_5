const cache = new Map();

export const apiFetch = async (url, options = {}) => {
  const method = options.method || 'GET';
  
  if (method === 'GET') {
    if (cache.has(url)) {
      return cache.get(url);
    }
    // const fetchPromise = fetch(url, options)
    //   .then(res => {
    //     if (!res.ok) throw new Error('API Error');
    //     return res.json();
    //   })
    //   .catch(err => {
    //     cache.delete(url);
    //     throw err;
    //   });
    //   cache.set(url, fetchPromise);
    //   return fetchPromise;
    const res = await fetch(url, options);
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    cache.set(url, data);
    return data;
  } else {
    // For POST, PUT, DELETE, PATCH we clear cache for the specific collection or all
    // To keep it simple, we can clear all cache to ensure freshness
    cache.clear();
    const res = await fetch(url, options);
    if (!res.ok) throw new Error('API Error');
    return res.json();
  }
};
