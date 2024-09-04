/**
 * updateLoyaltyTierPriceLevelMR.ts
 * © 2022 shelby.severin@trevera.com
 *
 * @NScriptName HF | Update Loyalty Tier Pricing
 * @NScriptType MapReduceScript
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/email", "N/format", "./loyaltyGlobals", "N/log", "N/query", "N/record", "N/runtime", "N/search"], function (require, exports, email, format, loyaltyGlobals_1, log, query, record, runtime, search) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.summarize = exports.reduce = exports.map = exports.getInputData = void 0;
    const getInputData = () => {
        const runForResults = runtime.getCurrentScript().getParameter({ name: 'custscript_hf_pricetier_results' });
        const runForCustomer = runtime.getCurrentScript().getParameter({ name: 'custscript_hf_pricetier_customer' });
        log.debug('params: ', `runForResults: ${runForResults}, runForCustomer: ${runForCustomer}`);
        if (Number(runForCustomer) > 0) {
            return getEligibleCustomers(runForCustomer);
        }
        const searchResults = getEligibleCustomers();
        log.audit(`updateLoyaltyTierPriceLevelMR: getInputData`, searchResults.length);
        if (Number(runForResults) > 0)
            searchResults.slice(0, Number(runForResults));
        return searchResults;
    };
    exports.getInputData = getInputData;
    const map = ctx => {
        try { // get all the lines for the order and write it to the values
            const valueObj = JSON.parse(ctx.value);
            const customerSpendYear = getCustomerSpendForYear(valueObj.id.toString());
            valueObj.customerspend = customerSpendYear;
            log.debug(`map`, `customer ${valueObj.id} spend: ${customerSpendYear}`);
            ctx.write(valueObj.id.toString(), JSON.stringify(valueObj));
        }
        catch (e) {
            log.error('map fn error', e);
        }
    };
    exports.map = map;
    const reduce = (context) => {
        const valueObjs = context.values;
        let message = ``;
        valueObjs.forEach((val) => {
            const mapObj = JSON.parse(val);
            const values = {};
            try {
                message = `Customer id ${mapObj.id} has pricelevel ${mapObj.pricelevel}, loyalty tier ${mapObj.customertierconfig.tierName} and spend ${mapObj.customerspend}. No change is necessary`;
                if (mapObj.pricelevel != mapObj.customertierconfig.tierPriceLevel) {
                    // log.audit(`Customer id: ${mapObj.id} has loyalty tiers ${mapObj.customertierconfig.tierName} pricelevel ${mapObj.pricelevel}`, `this doesn't match their pricelevel
                    // ${mapObj.customertierconfig.tierPriceLevel}`)
                    values['pricelevel'] = mapObj.customertierconfig.tierPriceLevel;
                    message =
                        `Customer id ${mapObj.id} has pricelevel ${mapObj.pricelevel} and loyalty tier ${mapObj.customertierconfig.tierName}. Their price level was updated to ${mapObj.customertierconfig.tierPriceLevel}\r\n`;
                }
                let idx = 0;
                const currentTierId = mapObj.loyaltytiers.findIndex(tier => { return tier.tierId == mapObj.loyaltytier; });
                for (let tier of mapObj.loyaltytiers) {
                    //log.audit(`customer ${mapObj.id} tier is ${mapObj.customertierconfig.tierName} and spend ${mapObj.customerspend}`, `Checking tier ${tier.tierName}: spend required: ${tier.tierSpendRequired}`);
                    if (mapObj.customerspend >= tier.tierSpendRequired && mapObj.customertierconfig.tierId != tier.tierId && idx > currentTierId) {
                        values['pricelevel'] = tier.tierPriceLevel;
                        values[loyaltyGlobals_1.loyaltyPointsTierFieldId] = tier.tierId;
                        message = `${idx}, ${currentTierId}. Customer id ${mapObj.id} has spend ${mapObj.customerspend} on current tier ${mapObj.customertierconfig.tierName} - spend required: ${tier.tierSpendRequired}. Moving to next tier ${tier.tierName}\r\n`;
                    }
                    idx++;
                }
                let customerDate = mapObj.datecreated;
                if (mapObj.customersince)
                    customerDate = mapObj.customersince;
                if (customerDate) {
                    const customerSince = format.parse({ value: customerDate, type: format.Type.DATE });
                    const expires = new Date(customerSince.getFullYear(), customerSince.getMonth(), customerSince.getDate() + mapObj.customertierconfig.tierExpireDays);
                    const now = new Date();
                    log.audit(`customerDate: expires: ${expires}`, `now: ${now}, mapObj.customerspend ${mapObj.customerspend}. spend required ${mapObj.loyaltytiers[currentTierId].tierSpendRequired}, expires < now: ${expires < now}, subsidiary: ${mapObj.subsidiary}`);
                    if (expires < now && mapObj.customerspend < mapObj.loyaltytiers[currentTierId].tierSpendRequired && mapObj.subsidiary == 3) {
                        values['pricelevel'] = 1; // 01. Regular Price
                        values[loyaltyGlobals_1.loyaltyPointsTierFieldId] = 4; // No Tier
                        message =
                            `Customer id ${mapObj.id} had spend ${mapObj.customerspend} on current tier ${mapObj.customertierconfig.tierName} - Spend required: ${mapObj.loyaltytiers[0].tierSpendRequired}. 
         Customer Since ${customerSince}, grace period expired ${expires}. Set to No Tier and Clear Price Level.\r\n`;
                    }
                }
                log.audit(`updateLoyaltyTierPriceLevelMR: reduce`, message);
                if (Object.keys(values).length > 0) {
                    record.submitFields({
                        type: record.Type.CUSTOMER,
                        id: mapObj.id,
                        values,
                        options: {
                            ignoreMandatoryFields: true,
                            enableSourcing: false
                        }
                    });
                }
            }
            catch (e) {
                log.error(`updateLoyaltyTierPriceLevelMR: reduce ${mapObj.id}`, e);
            }
        });
        context.write(context.key, JSON.stringify({ message, values: context.values }));
    };
    exports.reduce = reduce;
    function sortConfigByTier(a, b) {
        if (a.tierSpendRequired < b.tierSpendRequired) {
            return -1;
        }
        if (a.tierSpendRequired > b.tierSpendRequired) {
            return 1;
        }
        return 0;
    }
    const summarize = (context) => {
        const author = 339; // Shelby Severin
        const recipients = [339, 4]; //shelby, phil
        const subject = 'Loyalty Price Tier and Tier Up is Complete.';
        let body = ``;
        let numberUpdated = 0;
        context.output.iterator().each(function (key, value) {
            log.debug(`summarize`, `key ${key} value ${value}`);
            const val = JSON.parse(value);
            body += val.message.length > 0 ? `${val.message}\n` : '';
            numberUpdated++;
            return true;
        });
        if (body.length > 0)
            email.send({ author, recipients, subject, body });
        else
            email.send({ author, recipients, subject, body: `Script is complete but no messages were generated. ${numberUpdated} records were updated.` });
        log.debug('script complete', 'customers updated');
    };
    exports.summarize = summarize;
    function getCustomerSpendForYear(customerId) {
        let customerSpend = 0;
        const searchObj = search.load({ id: 'customsearch_hf_loyalty_spend' }); //[SCRIPT] Customer Spend per Year
        const searchFilters = searchObj.filterExpression;
        if (searchFilters.length > 0)
            searchFilters.push('and');
        searchFilters.push(['entity', 'anyof', [customerId]]);
        searchObj.filterExpression = searchFilters;
        const result = searchObj.run().getRange({ start: 0, end: 1 });
        log.debug('customer spend result: ', result[0].toJSON());
        if (result.length == 1) {
            // have to use fxamount (foreign currency) to make sure we're calculating against the right total
            // have to use amount if consolidated exchange rate is off
            customerSpend = Number(result[0].getValue({ name: 'netamount', summary: search.Summary.SUM }));
        }
        return customerSpend;
    }
    function getEligibleCustomers(customerId) {
        const loyaltyTiers = (0, loyaltyGlobals_1._getConfig)();
        log.audit('getEligibleCustomers', `loyalty tiers: ${JSON.stringify(loyaltyTiers)}`);
        let results = [];
        const columns = `customer.id, custentity_hf_loyalty_optin as optedin, custentity_hf_current_loyalty_tier as loyaltytier, BUILTIN.DF(custentity_hf_current_loyalty_tier) as loyaltytiername, 
  ${loyaltyGlobals_1.loyaltyTierOverrideFieldId} as tieroverride, pricelevel, customersubsidiaryrelationship.subsidiary as subsidiary, BUILTIN.DF(customersubsidiaryrelationship.subsidiary) as subsidiaryname, 
  custentity_hf_customer_since as customersince, currency, datecreated `;
        if (customerId)
            results = query.runSuiteQL({
                query: `SELECT ${columns} 
        FROM customer LEFT JOIN customersubsidiaryrelationship on customer.id = customersubsidiaryrelationship.entity
        WHERE customer.custentity_hf_loyalty_optin = 'T' AND customer.${loyaltyGlobals_1.loyaltyTierOverrideFieldId} = 'F' AND customer.id = ${customerId}`,
                params: []
            }).asMappedResults();
        else
            results = query.runSuiteQL({
                query: `SELECT ${columns} 
    FROM customer JOIN customersubsidiaryrelationship on customer.id = customersubsidiaryrelationship.entity 
    WHERE customer.custentity_hf_loyalty_optin = 'T' AND customer.${loyaltyGlobals_1.loyaltyTierOverrideFieldId} = 'F'`,
                params: []
            }).asMappedResults();
        log.debug('getEligibleCustomers', results);
        return results.map(result => {
            let matchingTiers = [];
            for (let tier in loyaltyTiers.tiers) {
                const tierConfig = loyaltyTiers.tiers[tier];
                log.debug('getEligibleCustomers', `currency: ${tierConfig.currency} | ${result.currency}, subsidiary: ${tierConfig.subsidiary} | ${result.subsidiary}, `);
                if (tierConfig.currency == result.currency && tierConfig.subsidiary == result.subsidiary) {
                    if (tierConfig.tierId == result.loyaltytier)
                        result.customertierconfig = tierConfig;
                    matchingTiers.push(tierConfig);
                }
            }
            matchingTiers = matchingTiers.sort(sortConfigByTier);
            //log.audit(`getEligibleCustomers: matchingTiers, result.loyaltytier ${result.loyaltytier}`, matchingTiers);
            result.loyaltytiers = matchingTiers;
            return result;
        });
    }
});
