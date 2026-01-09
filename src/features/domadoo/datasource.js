const { firefox } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const stealth = StealthPlugin();
stealth.enabledEvasions.delete('user-agent-override');

firefox.use(stealth);

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

        // Get the data 
        const rows = page.locator("#myaffiliateaccount-summary .list-group-hover");

        const last30days = {
            clicks: await rows.locator("div:nth-child(1) span.pull-xs-right").first().innerText(),
            waitingSales: await rows.locator("div:nth-child(3) span.pull-xs-right").first().innerText(),
            approvedSales: await rows.locator("div:nth-child(4) span.pull-xs-right").first().innerText(),
            earnings: await rows.locator("div:nth-child(5) span.pull-xs-right").first().innerText(),
        };

        const total = {
            clicks: await rows.locator("div:nth-child(1) span.pull-xs-right").nth(1).innerText(),
            approvedSales: await rows.locator("div:nth-child(3) span.pull-xs-right").nth(1).innerText(),
            earnings: await rows.locator("div:nth-child(4) span.pull-xs-right").nth(1).innerText(),
            waitingPayments: await rows.locator("div:nth-child(6) span.pull-xs-right").first().innerText(),
            balance: await rows.locator("div:nth-child(7) span.pull-xs-right").first().innerText(),
        };

        await browser.close();

        return {
            last30days,
            total,
        };

    } catch (error) {
        console.error("❌ Erreur lors de la récupération des données d'affiliation Domadoo :", error.message);
        browser.close();
    }
};

