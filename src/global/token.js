init()

export default {
  key: () => get('key'),
  authzHeader: () => `${get('token_type')} ${get('key') + get('access_token')}`,
  reset,
  accessToken: () => get('access_token')
}

function init() {
  set('key', createKey())
  set('token_type', 'Bearer')
  set('access_token')
}

function createKey() {
  return Math.random() // doesn't need to be cryptographically strong
    .toString(36) // convert to base-36 so we get more letters
    .substring(2) // strip off the leading '0.'
}

function get(key) {
  // TODO: currently no IE support for URLSearchParams (https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams#Browser_compatibility)
  // check this out for further info:  https://developers.google.com/web/updates/2016/01/urlsearchparams
  // polyfill if needed (https://github.com/jerrybendy/url-search-params-polyfill) or the WebReflection one...
  const params = new URLSearchParams(location.search)

  return sessionStorage.getItem(key) || params.get(key)
}

function set(key, def = '') {
  sessionStorage.setItem(key, get(key) || def)
}

function reset() {
  sessionStorage.removeItem('token_type')
  sessionStorage.removeItem('access_token')
}
