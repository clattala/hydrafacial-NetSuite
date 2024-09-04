/**
 * @NApiVersion 2.1
 * @author Shelby Severin <shelby.severin@trevera.com>
 * @NModuleScope Public
 * @NScriptName Trevera | Generate Nav Data
 * @NScriptType MapReduceScript
 */
define(["require", "exports", "N/file", "N/log", "N/search"], function (require, exports, file, log, search) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toNavItem = exports.toSCANavItemResult = exports.toSCAChildNavItem = exports.summarize = exports.reduce = exports.map = exports.getInputData = void 0;
    const getInputData = ctx => {
        const searchResults = mapResults('customsearch_trv_generate_nav_json'); //[SCRIPT] Generate Navigation JSON
        log.audit('searchResults count', searchResults.length);
        return searchResults.sort(sortSortOrder);
    };
    exports.getInputData = getInputData;
    const map = ctx => {
        try {
            // key will be master category internalid so items are grouped by their category into an array
            const valueObj = JSON.parse(ctx.value);
            const scaNavItem = (0, exports.toSCANavItemResult)(valueObj);
            let navItem = (0, exports.toNavItem)(scaNavItem);
            ctx.write(scaNavItem.internalid.toString(), JSON.stringify({ scaNavItem: scaNavItem, navItem: navItem }));
        }
        catch (e) {
            log.error('map fn error', e);
        }
    };
    exports.map = map;
    const reduce = (ctx) => {
        const valueObjs = ctx.values;
        const navMap = [];
        valueObjs.forEach((val) => {
            const mapObj = JSON.parse(val);
            let navItem = mapObj.navItem;
            try {
                navItem = addChildItemsToSubItem(navItem, mapObj.scaNavItem.deepness);
                navItem.numCategories += navItem.categories.length;
                if (Number(navItem.commerceCat) > 0) {
                    const url = search.lookupFields({ type: search.Type.COMMERCE_CATEGORY, id: navItem.commerceCat, columns: ['fullurl'] });
                    const fullURL = url['fullurl'];
                    if (fullURL && fullURL.length > 0)
                        navItem.href = fullURL;
                }
            }
            catch (e) {
                log.error('error generating nav item for ' + mapObj.navItem.text, e);
            }
            navMap.push(navItem);
        });
        ctx.write(ctx.key, JSON.stringify({ navMap: navMap }));
    };
    exports.reduce = reduce;
    const summarize = (ctx) => {
        let navItemsArr = [];
        const navMap = {};
        ctx.output.iterator().each(function (key, value) {
            log.audit(`key ${key}`, `${value}`); // key is the ID
            const valueJSON = JSON.parse(value);
            for (let navItem of valueJSON.navMap) { //NavItem
                if (navItem.parentId > 0) {
                    if (!navMap[navItem.parentId.toString()]) {
                        navMap[navItem.parentId.toString()] = {};
                        navMap[navItem.parentId.toString()].categories = [navItem];
                    }
                    else {
                        navMap[navItem.parentId.toString()].categories.push(navItem);
                    }
                }
                else if (!navMap[navItem.internalid.toString()]) {
                    navMap[navItem.internalid.toString()] = navItem;
                }
                else {
                    for (let prop in navItem) {
                        if (prop != 'categories')
                            navMap[navItem.internalid.toString()][prop] = navItem[prop];
                    }
                }
            }
            return true;
        });
        for (let nav in navMap) {
            navMap[nav].categories = navMap[nav].categories.sort(sortSortOrder);
            navItemsArr.push(navMap[nav]);
        }
        navItemsArr = navItemsArr.sort(sortSortOrder);
        const mapFile = file.create({
            name: `trv_sca_nav_items.json`,
            fileType: file.Type.JSON,
            contents: `{"navigation": ${JSON.stringify(navItemsArr)}}`,
            folder: 2500412,
            isOnline: true
        });
        const mapFileDirectLoad = file.create({
            name: `trv_sca_nav_items.js`,
            fileType: file.Type.JAVASCRIPT,
            contents: `var TRV_NAV_DATA = JSON.stringify(${JSON.stringify(navItemsArr)});`,
            folder: 2500412,
            isOnline: true
        });
        const fileId = mapFile.save();
        const fileIdDirectLoad = mapFileDirectLoad.save();
        log.audit('SCA Nav File Generated', `File ID ${fileId}, fileIdDirectLoad: ${fileIdDirectLoad}`);
    };
    exports.summarize = summarize;
    function sortAlpha(a, b) {
        if (a.text < b.text)
            return -1;
        if (a.text > b.text)
            return 1;
        return 0;
    }
    function sortSortOrder(a, b) {
        if (a.sortOrder < b.sortOrder)
            return -1;
        if (a.sortOrder > b.sortOrder)
            return 1;
        return 0;
    }
    function addChildItemsToSubItem(item, deepness) {
        let categories = item.categories;
        categories = categories.concat(getChildRecords(Number(item.internalid))); // add matching records of navigation type
        categories = categories.sort(sortSortOrder);
        if (deepness > 1) { // if deepness set, add on commerce category look ups
            categories = categories.concat(getChildCommerceCategories(Number(item.commerceCat), 2, deepness, item.limitChildren, item.website, item.permission));
        }
        log.debug('categories', categories);
        if (categories.length > 0) { // map to child items now
            for (let j = 0; j < categories.length; j++) {
                categories[j] = addChildItemsToSubItem(categories[j], categories[j].deepness);
            }
        }
        item.numCategories += categories.length;
        item.categories = categories.sort(sortSortOrder);
        return item;
    }
    function getChildRecords(parentId) {
        const searchObj = search.load({ id: 'customsearch_trv_generate_nav_json' }); // [SCRIPT] Generate Navigation JSON
        const filters = searchObj.filterExpression;
        if (filters.length > 0)
            filters.push('AND');
        filters.push(['custrecord_sca_nav_parent', 'anyof', [parentId]]);
        searchObj.filterExpression = filters;
        const pageData = searchObj.runPaged({ pageSize: 1000 });
        let results = [];
        pageData.pageRanges.forEach(function (pageRange) {
            let page = pageData.fetch({ index: pageRange.index });
            page.data.forEach(function (result) {
                const scaNavItem = (0, exports.toSCANavItemResult)(result.toJSON());
                const navItem = (0, exports.toNavItem)(scaNavItem);
                //log.audit(`nav item created parent id ${parentId}`, navItem);
                results.push(navItem);
            });
        });
        return results;
    }
    function mapResults(searchID) {
        const searchObj = search.load({ id: searchID });
        const filters = searchObj.filterExpression;
        if (filters.length > 0)
            filters.push('AND');
        filters.push(['custrecord_sca_nav_parent', 'anyof', ['@NONE@', '4109']]);
        searchObj.filterExpression = filters;
        const pageData = searchObj.runPaged({ pageSize: 1000 });
        let results = [];
        pageData.pageRanges.forEach(function (pageRange) {
            let page = pageData.fetch({ index: pageRange.index });
            page.data.forEach(function (result) {
                results.push(result.toJSON());
            });
        });
        return results;
    }
    function getChildCommerceCategories(parentId, i, deepness, limit, website, permission) {
        if (parentId < 1)
            return [];
        const categories = [];
        const searchObj = search.load({ id: 'customsearch_trv_search_comm_cats_urls' }); //[SCRIPT] Commerce Categories URLS
        const filters = searchObj.filterExpression;
        if (filters.length > 0)
            filters.push('AND');
        filters.push(['primaryparent', 'is', parentId]); // filter to get children of this nav item
        searchObj.filterExpression = filters;
        if (limit > 0) {
            const results = searchObj.run().getRange({ start: 0, end: limit });
            for (let r of results) {
                categories.push(toSCAChildNavItem(r, parentId, i, deepness, limit, website, permission));
            }
        }
        else {
            searchObj.run().each(function (result) {
                categories.push(toSCAChildNavItem(result, parentId, i, deepness, limit, website, permission));
                return true;
            });
        }
        return categories.sort(sortAlpha);
    }
    function toSCAChildNavItem(result, parentId, i, deepness, limit, website, permission) {
        const name = result.getValue('name');
        let normalizedID = name.toLowerCase().replace(/ /g, '_');
        let normalizedClass = name.toLowerCase().replace(/ /g, '-');
        normalizedID = normalizedID.replace(/[&\/\\#,+()$~%.'":*?<>{}!@]/g, '');
        normalizedClass = normalizedClass.replace(/[&\/\\#,+()$~%.'":*?<>{}!@]/g, '');
        return {
            internalid: result.id,
            id: normalizedID,
            text: name,
            website: website,
            cssClass: normalizedClass,
            href: result.getValue('fullurl'),
            level: i++,
            parentId: parentId,
            permission: permission.length > 0 ? permission : result.getValue('custrecord_sca_nav_permissions'),
            categories: [],
            sortOrder: i++,
            commerceCat: result.id,
            deepness: deepness - 1,
            limitChildren: limit,
            numCategories: 0,
            touchpoint: 'home'
        };
    }
    exports.toSCAChildNavItem = toSCAChildNavItem;
    const toSCANavItemResult = function (result) {
        //log.audit('toSCANavItemResult', result)
        return {
            internalid: result.id,
            parent: !!result.values['custrecord_sca_nav_parent'].length && result.values['custrecord_sca_nav_parent'].length > 0
                ? Number(result.values['custrecord_sca_nav_parent'][0].value)
                : 0,
            link: !!result.values['CUSTRECORD_sca_nav_COMMCAT.fullurl'] && result.values['CUSTRECORD_sca_nav_COMMCAT.fullurl'].length > 0
                ? result.values['CUSTRECORD_sca_nav_COMMCAT.fullurl']
                : result.values['custrecord_sca_nav_link'],
            text: result.values['custrecord_sca_nav_text'],
            sortOrder: Number(result.values['custrecord_sca_nav_sort_order']),
            website: result.values['custrecord_sca_nav_website'],
            commerceCat: !!result.values['custrecord_sca_nav_commcat'].length && result.values['custrecord_sca_nav_commcat'][0].value || null,
            limitChildren: Number(result.values['custrecord_sca_nav_limit']),
            deepness: Number(result.values['custrecord_sca_nav_deepness']),
            idOverride: result.values['custrecord_sca_nav_elem_id'],
            cssClass: result.values['custrecord_sca_nav_css'],
            touchpoint: result.values['custrecord_sca_nav_data_touchpoint'],
            buildShowMore: Number(result.values['custrecord_sca_nav_limit']) > 0,
            permission: result.values['custrecord_sca_nav_permissions']
        };
    };
    exports.toSCANavItemResult = toSCANavItemResult;
    const toNavItem = function (mapObj) {
        let normalizedID = mapObj.text.toLowerCase().replace(/ /g, '_');
        let normalizedClass = mapObj.text.toLowerCase().replace(/ /g, '-');
        normalizedID = normalizedID.replace(/[&\/\\#,+()$~%.'":*?<>{}!@]/g, '');
        normalizedClass = normalizedClass.replace(/[&\/\\#,+()$~%.'":*?<>{}!@]/g, '');
        return {
            internalid: mapObj.internalid.toString(),
            text: mapObj.text,
            id: mapObj.idOverride.length > 0 ? mapObj.idOverride : normalizedID,
            cssClass: `${mapObj.cssClass} ${normalizedClass}`,
            href: mapObj.link,
            level: 1,
            parentId: Number(mapObj.parent),
            permission: mapObj.permission,
            categories: [],
            numCategories: 0,
            sortOrder: mapObj.sortOrder,
            commerceCat: mapObj.commerceCat,
            deepness: mapObj.deepness,
            limitChildren: Number(mapObj.limitChildren),
            touchpoint: mapObj.touchpoint,
            website: mapObj.website
        };
    };
    exports.toNavItem = toNavItem;
});
