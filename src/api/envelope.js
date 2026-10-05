import api from "./axios";

// The gateway wraps payloads as { success, data, timestamp } (see AuthContext).
// The Postman collection documents requests only — no response bodies — so
// list/total readers below accept the common Nest pagination shapes rather
// than assuming one.
// Some gateway routes proxy a service that already wraps its own reply, so
// the envelope can be nested ({ success, data: { success, data: {...} } }) —
// peel every layer.
const isEnvelope = (p) => p && typeof p === "object" && !Array.isArray(p) && "data" in p && ("success" in p || "timestamp" in p);

export const unwrap = (payload) => {
  let body = payload;
  for (let i = 0; i < 5 && isEnvelope(body); i += 1) body = body.data;
  return body;
};

const LIST_KEYS = ["items", "data", "results", "rows", "records", "orders", "products"];

export const extractList = (payload) => {
  const body = unwrap(payload);
  if (Array.isArray(body)) return body;
  if (!body || typeof body !== "object") return [];
  for (const key of LIST_KEYS) {
    if (Array.isArray(body[key])) return body[key];
    if (body[key] && typeof body[key] === "object") {
      const nested = extractList(body[key]);
      if (nested.length) return nested;
    }
  }
  return [];
};

const toNumber = (v) => (typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" && !isNaN(v) ? Number(v) : null);

export const extractTotal = (payload) => {
  const body = unwrap(payload);
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const candidates = [
    body.total, body.totalCount, body.count, body.totalItems,
    body.meta?.total, body.meta?.totalItems, body.meta?.totalCount,
    body.pagination?.total, body.pagination?.totalItems,
    body.data?.total, body.data?.meta?.total, body.data?.pagination?.total,
  ];
  for (const c of candidates) {
    const n = toNumber(c);
    if (n !== null) return n;
  }
  return null;
};

const idOf = (item) => item?.id ?? item?._id ?? null;

// Dashboard counts must reflect the whole dataset, not page 1, so this walks
// pages until the backend reports everything was returned. `complete` is
// false only when we genuinely couldn't confirm that (page cap reached).
export const fetchAllPages = async (path, params = {}, { pageSize = 100, maxPages = 20, signal } = {}) => {
  const all = [];
  const seen = new Set();
  let total = null;

  for (let page = 1; page <= maxPages; page += 1) {
    const response = await api.get(path, { params: { ...params, page, limit: pageSize }, signal });
    const list = extractList(response.data);
    total = extractTotal(response.data) ?? total;

    let added = 0;
    for (const item of list) {
      const id = idOf(item);
      if (id != null && seen.has(id)) continue;
      if (id != null) seen.add(id);
      all.push(item);
      added += 1;
    }

    const backendIgnoredLimit = page === 1 && list.length > pageSize;
    const exhausted = list.length < pageSize || added === 0 || (total !== null && all.length >= total);
    if (backendIgnoredLimit || exhausted) return { items: all, total: total ?? all.length, complete: true };
  }

  return { items: all, total: total ?? all.length, complete: total !== null && all.length >= total };
};
