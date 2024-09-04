/// <amd-module name="SuiteCommerce.MapAndContactInfoCCT.View"/>
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
define("SuiteCommerce.MapAndContactInfoCCT.View", ["require", "exports", "CustomContentType.Base.View", "jQuery", "map_and_contact_info.tpl", "SuiteCommerce.MapAndContactUs.Common.Instrumentation.Helper"], function (require, exports, CustomContentTypeBaseView, jQuery, template, Instrumentation_Helper_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MapAndContactInfoCCTView = /** @class */ (function (_super) {
        __extends(MapAndContactInfoCCTView, _super);
        function MapAndContactInfoCCTView(options) {
            var _this = _super.call(this, options) || this;
            _this.template = template;
            _this.contextDataRequest = ['item'];
            if (options) {
                _this.container = options.container;
            }
            return _this;
        }
        MapAndContactInfoCCTView.prototype.install = function (options, contextData) {
            _super.prototype.install.call(this, options, contextData);
            Instrumentation_Helper_1.InstrumentationHelper.log({
                activity: 'Map and Contact loaded',
            });
            return jQuery.Deferred().resolve();
        };
        MapAndContactInfoCCTView.prototype.validateContextDataRequest = function () {
            return true;
        };
        MapAndContactInfoCCTView.prototype.getContext = function () {
            var hasHeader = !!this.settings.custrecord_cct_ns_mcicct_header;
            var hasContact = !!this.settings.custrecord_cct_ns_mcicct_busaddrinfo;
            var hasPhone = !!this.settings.custrecord_cct_ns_mcicct_phonenumber;
            var hasEmail = !!this.settings.custrecord_cct_ns_mcicct_primaryemail;
            return {
                mapPositionLeft: this.settings.custrecord_cct_ns_mcicct_mappos === '1',
                header: this.settings.custrecord_cct_ns_mcicct_header,
                hasHeader: hasHeader,
                mapUrl: this.settings.custrecord_cct_ns_mcicct_mapurl,
                hasMapUrl: !!this.settings.custrecord_cct_ns_mcicct_mapurl,
                singleColumnWidthClass: this.settings.custrecord_cct_ns_mcicct_mapurl
                    ? 'width-single-column'
                    : '',
                singleColumnCenterAlignmentClass: this.settings.custrecord_cct_ns_mcicct_mapurl
                    ? ''
                    : 'center-alignment-unique-column',
                contact: this.settings.custrecord_cct_ns_mcicct_busaddrinfo,
                hasContact: hasContact,
                phone: this.settings.custrecord_cct_ns_mcicct_phonenumber,
                hasPhone: hasPhone,
                phoneButtonText: this.settings.custrecord_cct_ns_mcicct_phonebtntext,
                email: this.settings.custrecord_cct_ns_mcicct_primaryemail,
                emailButtonText: this.settings.custrecord_cct_ns_mcicct_emailbtntext,
                hasEmail: hasEmail,
                hasAnyContact: hasContact || hasPhone || hasEmail,
                backgroundClass: this.settings.custrecord_cct_ns_mcicct_hidebackground === 'F' ? 'background-color' : '',
                hideIconsClass: this.settings.custrecord_cct_ns_mcicct_hideicons === 'T' ? 'hide-contact-icons' : '',
                mapAloneClass: !hasContact && !hasPhone && !hasEmail ? 'map-alone-class' : '',
            };
        };
        return MapAndContactInfoCCTView;
    }(CustomContentTypeBaseView));
    exports.MapAndContactInfoCCTView = MapAndContactInfoCCTView;
});
