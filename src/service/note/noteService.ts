'use strict';

import {IService, IServiceResponse} from "#/service/iService"
import {IAccount} from "#/service/iAccount"
import {AUTH_NAME, IAuth} from "#/auth/iAuth"
import {Browser, ElementHandle, launch} from "puppeteer";

class NoteService implements IService {
    account: IAccount;
    auth: IAuth;

    async accountUpdate(): Promise<IServiceResponse> {
        const browser: Browser = await launch({headless: false, args: ['--incognito']});
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.23 Safari/537.36');
        this.auth.page = page;

        console.log(`🚀: page.goto(note/login)`);
        await page.goto('https://note.com/login');
        switch (this.auth.name) {
            case AUTH_NAME.TWITTER:
                await page.waitFor('.btn-twitter');
                await page.click('.btn-twitter');
                break;
        }
        await this.auth.dispatch();

        await page.waitFor('.o-usermenuPopover');
        await page.click('.o-usermenuPopover');
        await page.waitFor('.o-usermenuPopover__summary', {visible: true});
        await page.click('.o-usermenuPopover__summary');
        await page.waitForNavigation();
        await page.waitFor('.o-creatorProfile__actionItemButton');
        await page.click('.o-creatorProfile__actionItemButton');

        const filePath: string = this.account.avatar;
        console.log(`🚀: update image ${filePath}`);
        await page.waitFor('.o-creatorProfile__contentInner [type="file"]');
        const input: ElementHandle = await page.$('.o-creatorProfile__contentInner [type="file"]');
        await input.uploadFile(filePath);

        await page.waitForXPath('//*[contains(@class,"m-modalFooterButtonGroup")]/button/*[contains(text(), "保存")]');
        await (await page.$x('//*[contains(@class,"m-modalFooterButtonGroup")]/button/*[contains(text(), "保存")]'))[0].click();

        await page.waitForXPath('//*[contains(@class,"o-creatorProfile__editButton")]/button/*[contains(text(), "保存")]');
        await (await page.$x('//*[contains(@class,"o-creatorProfile__editButton")]/button/*[contains(text(), "保存")]'))[0].click();
        await browser.close();
        return {status: 200}
    }
}

export {NoteService}