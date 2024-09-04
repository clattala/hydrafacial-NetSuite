/// <amd-module name="NetSuite.FeaturedProduct.FeaturedProductCCT"/>
define("NetSuite.FeaturedProduct.FeaturedProductCCT", ["require", "exports", "NetSuite.FeaturedProduct.FeaturedProductCCT.View"], function (require, exports, FeaturedProductCCT_View_1) {
    "use strict";
    return {
        mountToApp: function (container) {
            this.registerCCT(container);
        },
        registerCCT: function (container) {
            container.getComponent('CMS').registerCustomContentType({
                id: 'cct_netsuite_featuredproductcct',
                view: FeaturedProductCCT_View_1.FeaturedProductCCTView,
                options: {
                    container: container,
                },
            });
        },
    };
});
