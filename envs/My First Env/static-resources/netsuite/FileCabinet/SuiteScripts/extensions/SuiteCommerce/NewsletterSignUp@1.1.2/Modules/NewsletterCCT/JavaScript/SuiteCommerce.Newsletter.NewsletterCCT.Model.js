/// <amd-module name="SuiteCommerce.Newsletter.NewsletterCCT.Model"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("SuiteCommerce.Newsletter.NewsletterCCT.Model", ["require", "exports", "Backbone"], function (require, exports, Backbone_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var NewsletterCCTModel = /** @class */ (function (_super) {
        __extends(NewsletterCCTModel, _super);
        function NewsletterCCTModel() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.urlRoot = '/app/site/hosting/scriptlet.nl?script=customscript_ns_sc_ext_sl_newsletter_sp&deploy=customdeploy_ns_sc_ext_sl_newsletter_sp';
            return _this;
        }
        return NewsletterCCTModel;
    }(Backbone_1.Model));
    exports.NewsletterCCTModel = NewsletterCCTModel;
});
