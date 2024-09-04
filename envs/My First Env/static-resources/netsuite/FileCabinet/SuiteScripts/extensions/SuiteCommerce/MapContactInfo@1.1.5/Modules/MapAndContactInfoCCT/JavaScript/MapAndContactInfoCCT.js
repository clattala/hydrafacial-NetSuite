/// <amd-module name="SuiteCommerce.MapAndContactInfoCCT"/>
define("SuiteCommerce.MapAndContactInfoCCT", ["require", "exports", "SuiteCommerce.MapAndContactInfoCCT.View"], function (require, exports, MapAndContactInfoCCT_View_1) {
    "use strict";
    return {
        mountToApp: function (container) {
            this.registerCCT(container);
        },
        registerCCT: function (container) {
            container.getComponent('CMS').registerCustomContentType({
                id: 'cct_netsuite_mapcontactcct',
                view: MapAndContactInfoCCT_View_1.MapAndContactInfoCCTView,
                options: {
                    container: container,
                },
            });
        },
    };
});
