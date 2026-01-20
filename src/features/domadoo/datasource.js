const { firefox } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const stealth = StealthPlugin();
stealth.enabledEvasions.delete('user-agent-override');

firefox.use(stealth);

function normalizeSpaces(str = "") {
  return str.replace(/\u00a0/g, ' ').replace(/\u202f/g, ' ').trim();
}

function parseEuroToNumber(str = "") {
  // "4,41 €" -> 4.41
  const s = normalizeSpaces(str)
    .replace("€", "")
    .replace(/\s/g, "")
    .replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

async function getApprovedFromCell(cellLocator) {
  // Souvent l'info est dans une icône (HTML), pas dans le texte
  const html = (await cellLocator.innerHTML()).toLowerCase();

  // ✅ check
  if (
    html.includes("check") ||
    html.includes("fa-check") ||
    html.includes("icon-check") ||
    html.includes("✓")
  ) return true;

  // ❌ cross
  if (
    html.includes("close") ||
    html.includes("clear") ||
    html.includes("times") ||
    html.includes("fa-times") ||
    html.includes("icon-cross") ||
    html.includes("✗")
  ) return false;

  // fallback : innerText
  const txt = (await cellLocator.innerText()).toLowerCase();
  if (txt.includes("check") || txt.includes("✓")) return true;
  return false;
}

async function getTotalPages(page) {
  const container = page.locator("#myaffiliateaccount-sales-commissions");
  const pager = container.locator(".pagination, nav, ul.pagination").first();
  if ((await pager.count()) === 0) return 1;

  const texts = await pager.locator("a,button,li").allInnerTexts();
  const nums = texts
    .map(t => parseInt((t || "").trim(), 10))
    .filter(n => Number.isFinite(n));

  return nums.length ? Math.max(...nums) : 1;
}

async function scrapeCurrentSalesPage(page) {
  const table = page.locator("#myaffiliateaccount-sales-commissions table tbody");
  // Domadoo garde parfois le tbody caché => on attend juste qu'il soit présent
  await table.waitFor({ state: "attached", timeout: 100000 });

  const sales = [];
  const rowCount = await table.locator("tr").count();

  for (let i = 0; i < rowCount; i++) {
    const row = table.locator("tr").nth(i);

    const id = ((await row.locator("td").nth(0).textContent()) || "").trim();
    const date = ((await row.locator("td").nth(1).textContent()) || "").trim();
    const order = normalizeSpaces((await row.locator("td").nth(2).textContent()) || "");
    const commission = normalizeSpaces((await row.locator("td").nth(3).textContent()) || "");

    const approvedCell = row.locator("td").nth(4);
    const approved = await getApprovedFromCell(approvedCell);

    sales.push({ id, date, order, commission, approved });
  }

  return sales;
}

// ✅ Pagination robuste : pas de click (élément parfois invisible), on navigue par URL
async function goToSalesPageNumber(page, pageNumber) {
  const url = new URL("https://www.domadoo.fr/fr/affiliation");
  url.searchParams.set("t", "sales");
  url.searchParams.set("p", String(pageNumber));
  await page.goto(url.toString(), { waitUntil: "networkidle" });
}

exports.openDomadooAffiliationPageAndFindData = async () => {
  const browser = await firefox.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // open url
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("https://www.domadoo.fr/fr/affiliation");

    await page.fill('#field-email', process.env.DOMADOO_LOGIN);
    await page.fill('#field-password', process.env.DOMADOO_PASSWORD);
    await page.click('#submit-login');
    await page.waitForSelector('#my_affiliate_link', { timeout: 100000 });

    // Get the data (summary)
    const rows = page.locator("#myaffiliateaccount-summary .list-group-hover");

    const last30days = {
      clicks: await rows.locator("div:nth-child(1) span.pull-xs-right").first().innerText(),
      uniquesClicks: await rows.locator("div:nth-child(2) span.pull-xs-right").first().innerText(),
      waitingSales: await rows.locator("div:nth-child(3) span.pull-xs-right").first().innerText(),
      approvedSales: await rows.locator("div:nth-child(4) span.pull-xs-right").first().innerText(),
      earnings: normalizeSpaces(await rows.locator("div:nth-child(5) span.pull-xs-right").first().innerText()),
    };

    const total = {
      clicks: await rows.locator("div:nth-child(1) span.pull-xs-right").nth(1).innerText(),
      uniquesClicks: await rows.locator("div:nth-child(2) span.pull-xs-right").nth(1).innerText(),
      approvedSales: await rows.locator("div:nth-child(3) span.pull-xs-right").nth(1).innerText(),
      earnings: normalizeSpaces(await rows.locator("div:nth-child(4) span.pull-xs-right").nth(1).innerText()),
      payments: normalizeSpaces(await rows.locator("div:nth-child(5) span.pull-xs-right").nth(1).innerText()),
      waitingPayments: normalizeSpaces(await rows.locator("div:nth-child(6) span.pull-xs-right").first().innerText()),
      balance: normalizeSpaces(await rows.locator("div:nth-child(7) span.pull-xs-right").first().innerText()),
    };

    // 🔥 On se place sur l'onglet "sales" page 1
    await goToSalesPageNumber(page, 1);

    // Page 1 = comportement identique à avant (6 dernières ventes)
    const lastSales = await scrapeCurrentSalesPage(page);

    // Pagination : on scanne toutes les pages
    const totalPages = await getTotalPages(page);

    const allSalesMap = new Map();
    for (let p = 1; p <= totalPages; p++) {
      if (p > 1) await goToSalesPageNumber(page, p);
      const sales = await scrapeCurrentSalesPage(page);
      for (const s of sales) allSalesMap.set(s.id, s);
    }

    const allSales = [...allSalesMap.values()];

    // Ventes en attente d'approbation (❌)
    const waitingApprovalSales = allSales
      .filter(s => !s.approved)
      .map(s => ({
        ...s,
        commissionValue: parseEuroToNumber(s.commission),
      }));

    const waitingApprovalCommissionTotal = Math.round(
      waitingApprovalSales.reduce((sum, s) => sum + s.commissionValue, 0) * 100
    ) / 100;

    await browser.close();

    return {
      last30days,
      total,
      lastSales,

      waitingApprovalSales,
      waitingApprovalCommissionTotal,

      scanned: { totalPages, totalSales: allSales.length }
    };

  } catch (error) {
    console.error("❌ Erreur lors de la récupération des données d'affiliation Domadoo :", error.message);
    await browser.close().catch(() => {});
  }
};
