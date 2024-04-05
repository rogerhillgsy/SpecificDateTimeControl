import {test, request} from '@playwright/test';


test( 'Get WhoAmI response from server', async({page, baseURL}) =>{
    const context = await request.newContext({baseURL: `${process.env.environmentUrl}/api/data/v9.2/`,storageState : ".state"});

    const response = await context.get("WhoAmI");
    var body = await response.body();

    console.log(body.toString())
});