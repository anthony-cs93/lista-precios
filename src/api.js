const API_URL = import.meta.env.VITE_GSHEETS_URL;

async function request(method, body) {
  const opts = { method };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API_URL, opts);
  const data = await res.json().catch(() => null);
  if (!res.ok || !data || data.error) {
    throw new Error(data && data.error ? data.error : "Error en la solicitud");
  }
  return data;
}

export async function getItems() {
  return request("GET");
}

export async function verifyPassword(password) {
  return request("POST", { _action: "verify", _password: password });
}

export async function createItem(item, password) {
  return request("POST", { _action: "create", _password: password, ...item });
}

export async function updateItem(item, password) {
  return request("POST", { _action: "update", _password: password, ...item });
}
