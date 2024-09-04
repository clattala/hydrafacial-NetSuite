/// <amd-module name="NetSuite.FeaturedProduct.FeaturedProductCCT.View"/>
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
define("NetSuite.FeaturedProduct.FeaturedProductCCT.View", ["require", "exports", "underscore", "netsuite_featuredproduct_featuredproductcct.tpl", "SC.FeaturedProduct.Common.Utils", "SC.FeaturedProduct.Common.Configuration", "CustomContentType.Base.View", "SuiteCommerce.FeaturedProduct.Item.Collection", "SuiteCommerce.FeaturedProduct.Common.InstrumentationHelper", "SuiteCommerce.FeaturedProduct.Instrumentation"], function (require, exports, _, template, Common_Utils_1, Common_Configuration_1, CustomContentTypeBaseView, Item_Collection_1, InstrumentationHelper_1, Instrumentation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FeaturedProductCCTView = /** @class */ (function (_super) {
        __extends(FeaturedProductCCTView, _super);
        function FeaturedProductCCTView(options) {
            var _this = _super.call(this, options) || this;
            _this.contextDataRequest = ['item'];
            _this.template = template;
            _this.events = {
                'click [data-action="sc-fp-open-product-page"]': 'openProductPage',
            };
            _this.TO = Common_Utils_1.default.translate('to');
            _this.AVAILABLE = Common_Utils_1.default.translate('Available');
            _this.BTN_STYLE_MAP = {
                1: 'button-style-one',
                2: 'button-style-two',
            };
            if (options) {
                _this.container = options.container;
                _this.environment = _this.container.getComponent('Environment');
            }
            _this.on('afterViewRender', function () {
                var productId = Common_Utils_1.default.trim(_this.settings.custrecord_ns_sc_ext_fp_product ||
                    _this.settings.custrecord_ns_sc_ext_fp_productid);
                if (!!productId &&
                    (!_this.renderedProductData || productId !== _this.renderedProductData.id)) {
                    _this.loadProduct(productId);
                }
                else {
                    _this.renderData(_this.renderedProductData);
                }
            });
            return _this;
        }
        FeaturedProductCCTView.prototype.install = function (settings, contextData) {
            var result = _super.prototype.install.call(this, settings, contextData);
            this.getData();
            this.logSettings();
            return result;
        };
        FeaturedProductCCTView.prototype.update = function (settings) {
            var result = _super.prototype.update.call(this, settings);
            this.getData();
            return result;
        };
        FeaturedProductCCTView.prototype.getData = function () {
            var btnLink = "/product/" + Common_Utils_1.default.trim(this.settings.custrecord_ns_sc_ext_fp_product ||
                this.settings.custrecord_ns_sc_ext_fp_productid);
            var ribbonText = Common_Utils_1.default.trim(this.settings.custrecord_ns_sc_ext_fp_ribbontxt);
            var btnStyleClass = this.BTN_STYLE_MAP[this.settings.custrecord_ns_sc_ext_fp_btnstyle];
            var hasBtnText = !!Common_Utils_1.default.trim(this.settings.custrecord_ns_sc_ext_fp_btntxt);
            var hasRibbonText = !!Common_Utils_1.default.trim(this.settings.custrecord_ns_sc_ext_fp_ribbontxt);
            this.productData = {};
            this.productData.btnStyleClass = btnStyleClass;
            this.productData.btnLink = btnLink;
            this.productData.btnText = Common_Utils_1.default.trim(this.settings.custrecord_ns_sc_ext_fp_btntxt);
            this.productData.hasBtnText = hasBtnText;
            this.productData.ribbonText = ribbonText;
            this.productData.hasRibbonText = hasRibbonText;
            this.productData.target =
                Common_Utils_1.default.trim(this.settings.custrecord_ns_sc_ext_fp_newwindow) === 'T'
                    ? '_blank'
                    : '_self';
            this.productData.showPrice =
                Common_Utils_1.default.trim(this.settings.custrecord_ns_sc_ext_fp_hideprice) === 'F';
            this.productData.showItemAvailability =
                Common_Utils_1.default.trim(this.settings.custrecord_ns_sc_ext_fp_hideavailability) ===
                    'F';
        };
        FeaturedProductCCTView.prototype.logSettings = function () {
            InstrumentationHelper_1.InstrumentationHelper.log({
                activity: 'Hide price',
                subType: this.productData.showPrice ? 'Disabled' : 'Enabled',
            });
            InstrumentationHelper_1.InstrumentationHelper.log({
                activity: 'Hide availability',
                subType: this.productData.showItemAvailability ? 'Disabled' : 'Enabled',
            });
            InstrumentationHelper_1.InstrumentationHelper.log({
                activity: 'Ribbon text defined',
                subType: this.productData.hasRibbonText ? 'defined' : 'undefined',
            });
            InstrumentationHelper_1.InstrumentationHelper.log({
                activity: 'Call to action style',
                subType: this.productData.btnStyleClass == 'button-style-one'
                    ? 'Primary'
                    : 'Secondary',
            });
        };
        FeaturedProductCCTView.prototype.validateContextDataRequest = function () {
            return true;
        };
        FeaturedProductCCTView.prototype.getContext = function () {
            return {
                btnStyleClass: this.productData.btnStyleClass,
                btnLink: this.productData.btnLink,
                btnText: this.productData.btnText,
                hasBtnText: this.productData.hasBtnText,
                ribbonText: this.productData.ribbonText,
                hasRibbonText: this.productData.hasRibbonText,
                target: this.productData.target,
                showPrice: this.productData.showPrice,
                showItemAvailability: this.productData.showItemAvailability,
            };
        };
        FeaturedProductCCTView.prototype.renderData = function (data) {
            if (data && this.isValidItem) {
                this.$('.featuredproductcct-layout-invalid-item-message').hide();
                this.setImageSrc(data);
                this.$('.product-name').text(data.name);
                this.$('.product-description').html(data.description);
                this.$('.product-formatted-price').html(data.formattedPrice);
                if (data.inStock) {
                    this.$('.product-in-stock, .product-qty-available').show();
                    if (data.quantityAvailable) {
                        this.$('.product-qty-available-number').text(this.AVAILABLE + ': ' + data.quantityAvailable);
                    }
                }
                else {
                    this.$('.product-out-of-stock').show();
                }
                this.$('.featuredproductcct-layout-row').show();
            }
            else {
                this.$('.featuredproductcct-layout-invalid-item-message').show();
                this.$('.featuredproductcct-layout-row').hide();
            }
        };
        FeaturedProductCCTView.prototype.setImageSrc = function (data) {
            var imgSrc = Common_Utils_1.default.trim(this.settings.custrecord_ns_sc_ext_fp_displayimg_url) ||
                data.imgSrc;
            if (this.settings.custrecord_ns_sc_ext_fp_displayimg_url) {
                InstrumentationHelper_1.InstrumentationHelper.log({
                    activity: 'Image product changed',
                });
            }
            imgSrc = this.setImageSize(imgSrc);
            this.$('.product-image').attr('src', imgSrc);
            this.$('.product-image').attr('alt', data.imgAltText);
            this.$('.product-image').attr('title', data.imgAltText);
        };
        FeaturedProductCCTView.prototype.setImageSize = function (imgSrc) {
            var targetSizeName = Common_Utils_1.default.trim(this.settings.custrecord_ns_sc_ext_fp_imageresizeid);
            if (!targetSizeName)
                return imgSrc;
            var availableSizes = Common_Configuration_1.Configuration.get('siteSettings.imagesizes');
            return Common_Utils_1.default.resizeImage(availableSizes, imgSrc, targetSizeName);
        };
        FeaturedProductCCTView.prototype.getProductImage = function (productData) {
            var src = '';
            var altText = '';
            var itemImagesDetail;
            var images;
            if (productData) {
                itemImagesDetail = (productData.get('itemimages_detail') ||
                    {});
                images = this.imageFlatten(itemImagesDetail);
                if (images.length) {
                    src = images[0].url;
                    altText = images[0].altimagetext;
                }
                else {
                    src = Common_Utils_1.default.getThemeAbsoluteUrlOfNonManagedResources('img/no_image_available.jpeg', Common_Configuration_1.Configuration.get('imageNotAvailable'));
                    altText = 'Image not available';
                }
            }
            return {
                src: src,
                altText: altText,
            };
        };
        FeaturedProductCCTView.prototype.imageFlatten = function (images) {
            var _this = this;
            if ('url' in images && 'altimagetext' in images) {
                return [images];
            }
            return _.flatten(_.map(images, function (item) {
                if (_.isArray(item)) {
                    return item;
                }
                return _this.imageFlatten(item);
            }));
        };
        FeaturedProductCCTView.prototype.renderProduct = function (productData, id) {
            var imgData = this.getProductImage(productData);
            var price = this.getItemPrice(productData);
            this.renderedProductData = {
                id: id,
                name: productData.getName(),
                quantityAvailable: productData.get('quantityavailable'),
                inStock: productData.get('isinstock'),
                description: productData.getDescription(),
                formattedPrice: price,
                imgSrc: imgData.src,
                imgAltText: imgData.altText,
            };
            this.renderData(this.renderedProductData);
        };
        FeaturedProductCCTView.prototype.getItemPrice = function (productData) {
            var min;
            var max;
            var minFormatted;
            var maxFormatted;
            var priceData;
            var matrixChildItemsDetail = productData.get('matrixchilditems_detail');
            if (Common_Utils_1.default.hidePrices()) {
                return '';
            }
            if (matrixChildItemsDetail && matrixChildItemsDetail.length > 0) {
                min = 0;
                max = 0;
                minFormatted = '';
                maxFormatted = '';
                _.each(matrixChildItemsDetail, function (itemDetail) {
                    var priceDetail = itemDetail.onlinecustomerprice_detail;
                    var price = priceDetail && (priceDetail.onlinecustomerprice || priceDetail.pricelevel1) || 0;
                    var priceFormatted = priceDetail && (priceDetail.onlinecustomerprice_formatted || priceDetail.pricelevel1_formatted) ||
                        '0';
                    if (price > 0 && (price < min || min === 0)) {
                        min = price;
                        minFormatted = priceFormatted;
                    }
                    if (price > max) {
                        max = price;
                        maxFormatted = priceFormatted;
                    }
                });
                if (min > 0 && max > 0 && min !== max) {
                    return minFormatted + " " + this.TO + " " + maxFormatted;
                }
            }
            priceData = productData.get('onlinecustomerprice_detail') || {};
            return (priceData && priceData.onlinecustomerprice_formatted ||
                productData.pricelevel1_formatted ||
                '');
        };
        FeaturedProductCCTView.prototype.loadProduct = function (id) {
            var _this = this;
            var itemCollection = new Item_Collection_1.default(null, {
                environment: this.environment,
                ids: [id],
            });
            var log = Instrumentation_1.default.getLog('CCTloadingtime');
            log.startTimer();
            itemCollection
                .fetch()
                .done(function () {
                var item;
                if (itemCollection.length && !itemCollection.models[0].isMatrixChild()) {
                    item = itemCollection.models[0];
                    _this.isValidItem = true;
                    _this.renderProduct(item, id);
                }
                else {
                    _this.isValidItem = false;
                    _this.renderData();
                }
                _this.logSubmission(log, 'success');
            })
                .fail(function () {
                _this.isValidItem = false;
                _this.renderData();
                _this.logSubmission(log, 'fail');
                console.warn('Unexpected error searching the product.');
            });
        };
        FeaturedProductCCTView.prototype.logSubmission = function (log, result) {
            log.endTimer();
            log.setParameters({
                activity: 'CCT loading time',
                operationStatus: result,
                totalTime: log.getElapsedTimeForTimer(),
            });
            log.submit();
        };
        FeaturedProductCCTView.prototype.openProductPage = function () {
            InstrumentationHelper_1.InstrumentationHelper.log({
                activity: 'Open product page',
            });
        };
        return FeaturedProductCCTView;
    }(CustomContentTypeBaseView));
    exports.FeaturedProductCCTView = FeaturedProductCCTView;
});
