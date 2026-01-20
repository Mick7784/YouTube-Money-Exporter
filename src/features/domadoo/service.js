const datasource = require('./datasource');
const cache = require('../../utils/cache');

const CACHE_FILE = 'domadoo.json';

function mergeDomadooCache(existing = {}, incoming = {}) {
  const merged = { ...existing, ...incoming };

  // Merge nested objects so we don't lose fields (ex: last30days.waitingApprovalCommission)
  if (existing.last30days || incoming.last30days) {
    merged.last30days = { ...(existing.last30days || {}), ...(incoming.last30days || {}) };
  }
  if (existing.total || incoming.total) {
    merged.total = { ...(existing.total || {}), ...(incoming.total || {}) };
  }

  // lastSales: keep incoming if provided
  if (incoming.lastSales) merged.lastSales = incoming.lastSales;

  return merged;
}

// Hourly (light): page 1 only
exports.fetchDomadooAffiliation = async () => {
  console.log("🌐 Fetching Domadoo data (hourly)...");

  const data = await datasource.openDomadooAffiliationPageAndFindData();
  const existing = (await cache.get(CACHE_FILE)) || {};

  const merged = mergeDomadooCache(existing, data);
  merged.lastUpdate = new Date().toISOString();

  await cache.set(merged, CACHE_FILE);
  return merged;
};

// Daily (heavy): scan all pages + pending commissions (total + 30 days)
// Also writes last30days.waitingApprovalCommission for domadoo/last30days/waitingApprovalCommission
exports.fetchDomadooPendingDaily = async () => {
  console.log("🧾 Fetching Domadoo pending commissions (daily)...");

  const data = await datasource.openDomadooAffiliationPageAndFindData({ scanAllPages: true });

  const dailyPayload = {
    waitingApprovalCommissionTotal: data?.waitingApprovalCommissionTotal || 0,
    waitingApprovalCommission30Days: data?.waitingApprovalCommission30Days || 0,
    waitingApprovalSales: data?.waitingApprovalSales || [],
    scanned: data?.scanned,
    last30days: data?.last30days || {},
  };

  const existing = (await cache.get(CACHE_FILE)) || {};
  const merged = mergeDomadooCache(existing, dailyPayload);
  merged.lastUpdatePending = new Date().toISOString();

  await cache.set(merged, CACHE_FILE);
  return merged;
};
