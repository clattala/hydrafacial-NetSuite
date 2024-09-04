/// <amd-module name="SuiteCommerce.Columns.ColumnsCCT"/>
define("SuiteCommerce.Columns.ColumnsCCT", ["require", "exports", "SuiteCommerce.Columns.ColumnsCCT.View"], function (require, exports, ColumnsCCT_View_1) {
    "use strict";
    return {
        mountToApp: function (container) {
            var cmsComponent = container.getComponent('CMS');
            if (cmsComponent) {
                cmsComponent.registerCustomContentType({
                    id: 'cct_netsuite_columns',
                    view: ColumnsCCT_View_1.CCTView,
                    options: {
                        container: container,
                    },
                });
            }
        },
    };
});
