const { firefox } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const stealth = StealthPlugin();
stealth.enabledEvasions.delete('user-agent-override');

firefox.use(stealth);

function normalizeSpaces(str = "") {
  return String(str).replace(/\u00a0/g, ' ').replace(/\u202f/g, ' ').trim();
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

function parseDomadooDateToTs(dateStr = "") {
  // Domadoo: "YYYY-MM-DD HH:mm:ss"
  // On transforme en ISO local: "YYYY-MM-DDTHH:mm:ss"
  const s = normalizeSpaces(dateStr);
  if (!s) return NaN;
  const isoLocal = s.replace(' ', 'T');
  const d = new Date(isoLocal);
  const ts = d.getTime();
  return Number.isFinite(ts) ? ts : NaN;
}

async function getApprovedFromCell(cellLocator) {
  // Souvent l'info est dans une icône (HTML), pas dans le texte
  const html = (await cellLocator.innerHTML()).toLowerCase();

  // ✅ check
  if (html.includes("check") || html.includes("fa-check") || html.includes("icon-check") || html.includes("✓")) return true;

  // ❌ cross
  if (html.includes("close") || html.includes("clear") || html.includes("times") || html.includes("fa-times") || html.includes("icon-cross") || html.includes("✗")) return false;

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
  // Domadoo garde parfois le tbody "hidden" => on attend juste qu'il soit présent
  await table.waitFor({ state: "attached", timeout: 100000 });

  const sales = [];
  const rowCount = await table.locator("tr").count();

  for (let i = 0; i < rowCount; i++) {
    const row = table.locator("tr").nth(i);

    const id = normalizeSpaces(await row.locator("td").nth(0).innerText());
    const date = normalizeSpaces(await row.locator("td").nth(1).innerText());
    const order = normalizeSpaces(await row.locator("td").nth(2).innerText());
    const commission = normalizeSpaces(await row.locator("td").nth(3).innerText());

    const approvedCell = row.locator("td").nth(4);
    const approved = await getApprovedFromCell(approvedCell);

    sales.push({
      id,
      date,
      order,
      commission,
      approved,
      commissionValue: parseEuroToNumber(commission),
      dateTs: parseDomadooDateToTs(date),
    });
  }

  return sales;
}

async function gotoSalesPage(page, n) {
  // Navigation directe = évite les problèmes de click (élément pas visible)
  const url = `https://www.domadoo.fr/fr/affiliation?t=sales&p=${n}`;
  await page.goto(url, { waitUntil: "domcontentloaded" });

  // attend que la 1ère ligne existe
  await page
    .locator("#myaffiliateaccount-sales-commissions table tbody tr:first-child td:first-child")
    .waitFor({ state: "attached", timeout: 100000 });
}

exports.openDomadooAffiliationPageAndFindData = async ({ scanAllPages = false } = {}) => {
  const browser = await firefox.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.setViewportSize({ width: 1280, height: 720 });

    // Login
    await page.goto("https://www.domadoo.fr/fr/affiliation", { waitUntil: "domcontentloaded" });
    await page.fill('#field-email', process.env.DOMADOO_LOGIN);
    await page.fill('#field-password', process.env.DOMADOO_PASSWORD);
    await page.click('#submit-login');
    await page.waitForSelector('#my_affiliate_link', { timeout: 100000 });

    // Summary
    const rows = page.locator("#myaffiliateaccount-summary .list-group-hover");

    const last30days = {
      clicks: await rows.locator("div:nth-child(1) span.pull-xs-right").first().innerText(),
      uniquesClicks: await rows.locator("div:nth-child(2) span.pull-xs-right").first().innerText(),
      waitingSales: await rows.locator("div:nth-child(3) span.pull-xs-right").first().innerText(),
      approvedSales: await rows.locator("div:nth-child(4) span.pull-xs-right").first().innerText(),
      earnings: normalizeSpaces(await rows.locator("div:nth-child(5) span.pull-xs-right").first().innerText()),
      // on ajoutera waitingApprovalCommission en mode daily
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

    // Ventes page 1 (rapide)
    await gotoSalesPage(page, 1);
    const lastSales = await scrapeCurrentSalesPage(page);

    // Mode hourly = on s'arrête là
    if (!scanAllPages) {
      await browser.close().catch(() => {});
      return { last30days, total, lastSales };
    }

    // Mode daily = pagination + pending sum (all time + last 30 days)
    const cutoffTs = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const totalPages = await getTotalPages(page);

    let waitingApprovalCommissionTotal = 0;
    let waitingApprovalCommission30Days = 0;
    const waitingApprovalSales = []; // on garde uniquement les pending <= 30j pour limiter le volume

    let totalSalesScanned = 0;

    for (let p = 1; p <= totalPages; p++) {
      if (p !== 1) await gotoSalesPage(page, p);

      const pageSales = await scrapeCurrentSalesPage(page);
      totalSalesScanned += pageSales.length;

      // Si la page est entièrement plus vieille que 30j, on pourra arrêter après traitement (optimisation)
      let allOlderThanCutoff = true;

      for (const s of pageSales) {
        const ts = s.dateTs;
        if (Number.isFinite(ts) && ts >= cutoffTs) allOlderThanCutoff = false;

        if (s.approved === false) {
          waitingApprovalCommissionTotal += (s.commissionValue || 0);

          if (Number.isFinite(ts) && ts >= cutoffTs) {
            waitingApprovalCommission30Days += (s.commissionValue || 0);
            waitingApprovalSales.push(s);
          }
        }
      }

      if (allOlderThanCutoff) break;
    }

    waitingApprovalCommissionTotal = Math.round(waitingApprovalCommissionTotal * 100) / 100;
    waitingApprovalCommission30Days = Math.round(waitingApprovalCommission30Days * 100) / 100;

    // ✅ prêt à merger dans domadoo.last30days.waitingApprovalCommission
    last30days.waitingApprovalCommission = waitingApprovalCommission30Days;

    await browser.close().catch(() => {});
    return {
      last30days,
      total,
      lastSales,
      waitingApprovalSales,
      waitingApprovalCommissionTotal,
      waitingApprovalCommission30Days,
      scanned: { totalPages, totalSales: totalSalesScanned },
    };

  } catch (error) {
    console.error("❌ Erreur lors de la récupération des données d'affiliation Domadoo :", error.message);
    await browser.close().catch(() => {});
  }
};
