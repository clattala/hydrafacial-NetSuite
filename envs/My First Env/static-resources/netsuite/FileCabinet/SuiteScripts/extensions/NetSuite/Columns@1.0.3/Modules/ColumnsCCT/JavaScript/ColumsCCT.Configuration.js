/// <amd-module name="SuiteCommerce.Columns.ColumnsCCT.Configuration"/>
define("SuiteCommerce.Columns.ColumnsCCT.Configuration", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TEXT_COLOR_CLASS = {
        1: '',
        2: 'columnscct-text-color-dark',
        3: 'columnscct-text-color-light',
    };
    var TEXT_ALIGN_CLASS = {
        1: 'columnscct-text-align-left',
        2: 'columnscct-text-align-center',
    };
    var CCTConfiguration = /** @class */ (function () {
        function CCTConfiguration() {
        }
        CCTConfiguration.getTextColorClass = function (option) {
            return TEXT_COLOR_CLASS[option] || '';
        };
        CCTConfiguration.getTextAlignClass = function (option) {
            return TEXT_ALIGN_CLASS[option] || TEXT_ALIGN_CLASS[1]; //default value is 1
        };
        return CCTConfiguration;
    }());
    exports.CCTConfiguration = CCTConfiguration;
});
