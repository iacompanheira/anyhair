export const navigate = (path: string) => {
  const newHash = path.startsWith('/') ? path.substring(1) : path;
  
  // When navigating to the home page, setting the hash to just '/' is a more
  // robust and standard method for hash-based routing than an empty string or
  // using window.location.href, as it avoids a full page reload.
  if (path === '/') {
    window.location.hash = '/';
  } else {
    window.location.hash = newHash;
  }
};
