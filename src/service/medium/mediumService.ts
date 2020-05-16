'use strict';

import {IService, IServiceResponse} from "#/service/iService"
import {IAccount} from "#/service/iAccount"
import {AUTH_NAME, IAuth} from "#/auth/iAuth"
import {Browser, ElementHandle} from "puppeteer";

class MediumService implements IService {
    account: IAccount;
    auth: IAuth;
    browser: Browser;

    async accountUpdate(): Promise<IServiceResponse> {
        const page = await this.browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.23 Safari/537.36');

        console.log(`🚀: page.goto(meidum/top)`);
        await page.goto('https://medium.com');

        await (await page.$x('//a[text() = "Sign in"]'))[0].click();
        switch (this.auth.name) {
            case AUTH_NAME.GOOGLE:
                await page.click('#susi-modal-google-button');
                break;
        }
        this.auth.page = page;
        await this.auth.dispatch();

        console.log(`🚀: page.goto(Profile)`);
        await page.waitForNavigation();
        await page.waitFor('button[data-action="open-userActions"]', {visible: true});
        await page.click('button[data-action="open-userActions"]');
        await page.waitForXPath('//a[text()="Profile"]', {visible: true});
        await (await page.$x('//a[text()="Profile"]'))[0].click();

        console.log(`🚀: page.goto(EditProfile)`);
        await page.waitForNavigation();
        await page.waitForXPath('//a[text()="Edit profile"]', {visible: true});
        await (await page.$x('//a[text()="Edit profile"]'))[0].click();

        console.log(`🚀: page.goto(Upload image)`);
        await page.waitForNavigation();
        await page.waitFor('.hero-avatarPicker', {visible: true});
        await page.click('.hero-avatarPicker');
        await page.waitFor('input[type="file"]', {visible: true});
        const input: ElementHandle = await page.$('input[type="file"]');
        await input.uploadFile(this.account.avatar);

        await page.click('button[data-action="save-profile"]');

        return {status: 200}
    }
}

export {MediumService}