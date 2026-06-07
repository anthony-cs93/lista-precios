const API_URL = import.meta.env.VITE_GSHEETS_URL;

async function request(method, body) {
  const opts = { method };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API_URL, opts);
  if (!res.ok) throw new Error("Error en la solicitud");
  return res.json();
}

export async function getItems() {
  return request("GET");
}

export async function createItem(item) {
  return request("POST", { _action: "create", ...item });
}

export async function updateItem(item) {
  return request("POST", { _action: "update", ...item });
}

