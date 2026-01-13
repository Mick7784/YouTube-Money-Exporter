const { firefox } = require('playwright');
const {authenticator} = require('otplib');


exports.openAmazonReportingPageAndFindData = async () => {
    const browser = await firefox.launch({headless: true});
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // open url
        await page.goto("https://partenaires.amazon.fr/p/reporting/earnings");
        await page.fill('#ap_email', process.env.AMAZON_LOGIN);
        await page.click('#continue');
        await page.fill('#ap_password', process.env.AMAZON_PASSWORD);
        await page.click('#signInSubmit');
        if (process.env.AMAZON_SECRET_KEY) {
            const token = authenticator.generate(process.env.AMAZON_SECRET_KEY.replaceAll(/\s+/g, ''));
            await page.fill('#auth-mfa-otpcode', token);
            await page.click('#auth-signin-button');
        }
        await page.waitForSelector('#ac-report-commission-commision-clicks', { timeout: 10000 });

        // Get the data
        const thisMonth = {
            clicks: await page.textContent("#ac-report-commission-commision-clicks"),
            itemsOrdered: await page.textContent("#ac-report-commission-commision-ordered"),
            itemsShipped: await page.textContent("#ac-report-commission-commision-shipped"),
            itemsReturned: await page.textContent("#ac-report-commission-commision-returned"),
            conversionRate: await page.textContent("#ac-report-commission-commision-conversion"),
            sumItemsShipped: (await page.textContent("#ac-report-commission-commision-shipped-revenue")).replace('€', '').trim() + ' €',
            earnings: (await page.textContent("#ac-report-commission-commision-total")).replace('€', '').trim() + ' €',
        }

        // Click on history
        await page.goto("https://partenaires.amazon.fr/home/account/paymentHistory");
        const waitingPayments = await page.textContent("#payment-cards-section div div:nth-child(2) a span span");

        await browser.close();
        
        return {
            thisMonth,
            waitingPayments,
        };

    } catch (error) {
        console.error("❌ Erreur lors de la navigation vers la page Amazon Reporting :", error.message);
        browser.close();
    }
};
