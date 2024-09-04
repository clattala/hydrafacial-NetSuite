/**
 * tierConfigUserEvent.ts
 * by shelby.severin@trevera.com
 *
 * @NScriptName HF | Loyalty | Config UE
 * @NScriptType UserEventScript
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/error", "N/log", "N/search"], function (require, exports, err, log, search) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.beforeSubmit = void 0;
    const _recId = 'customrecord_hf_loyalty_tier_config';
    function beforeSubmit(context) {
        if (context.type == context.UserEventType.DELETE)
            return;
        if ([context.UserEventType.CREATE, context.UserEventType.COPY, context.UserEventType.EDIT].includes(context.type)) {
            const filters = getFilters(context.newRecord);
            if (context.newRecord.id > 0) {
                filters.push('and');
                filters.push(['internalid', 'noneof', context.newRecord.id]);
            }
            const tierSearch = search.create({ type: _recId, filters });
            log.debug('tierSearch results', tierSearch.runPaged().count);
            if (tierSearch.runPaged().count > 0) {
                throw err.create({ name: 'ERR_DUPLICATE_TIER_CONFIG', message: 'There is already a tier configured for this level, currency and subsidiary' });
            }
        }
    }
    exports.beforeSubmit = beforeSubmit;
    function getFilters(rec) {
        const tier = Number(rec.getValue('custrecord_hf_loyalty_tier'));
        const currency = Number(rec.getValue('custrecord_hf_tier_currency'));
        const subsidiary = Number(rec.getValue('custrecord_hf_tier_subsidiary'));
        log.debug(`checking`, `tier: ${tier} currency: ${currency} subsidiary: ${subsidiary}`);
        return [
            ['isinactive', 'is', false], 'and',
            ['custrecord_hf_loyalty_tier', 'anyof', tier], 'and',
            ['custrecord_hf_tier_subsidiary', 'anyof', subsidiary], 'and',
            ['custrecord_hf_tier_currency', 'anyof', currency]
        ];
    }
});
