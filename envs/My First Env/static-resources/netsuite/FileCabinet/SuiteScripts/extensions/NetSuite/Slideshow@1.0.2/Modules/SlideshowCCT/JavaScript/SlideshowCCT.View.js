define('NetSuite.Slideshow.SlideshowCCT.View',    [        'CustomContentType.Base.View',        'NetSuite.Slideshow.SlideshowCCT.Collection',        'NetSuite.Slideshow.SlideshowCCT.Model',        'netsuite_slideshow_slideshowcct.tpl',        'jQuery',        'SuiteCommerce.Slideshow.Common.Utils',        'underscore',        'jQuery.bxSlider@4.2.14'    ],    function (        CustomContentTypeBaseView,        SlideshowCCTCollection,        SlideshowCCTModel,        netsuite_slideshow_slideshowcct_tpl,        jQuery,        Utils,        _    ) {        'use strict';        return CustomContentTypeBaseView.extend({            template: netsuite_slideshow_slideshowcct_tpl,            IMG_ALIGN_MAP: {                1: 'bg-center-top',                2: 'bg-center-center',                3: 'bg-center-bottom'            },            IMG_OVERLAY_MAP: {                1: '',                2: 'content-dark',                3: 'content-light'            },            TEXT_ALIGN_MAP: {                1: 'content-box-left',                2: 'content-box-right',                3: 'content-box-center'            },            TEXT_COLOR_MAP: {                1: 'content-color-text-dark',                2: 'content-color-text-light'            },            BTN_STYLE_MAP: {                1: 'button-style-one',                2: 'button-style-two'            },            SPEED_MAP: {                1: '3000',                2: '4000',                3: '5000',                4: '6000',                5: '7000',                6: '8000'            },            SECTION_HEIGHT_MAP: {                1: 'section-small',                2: 'section-medium',                3: 'section-large'            },            HTML_TAGS_REGEX: /<[^>]+>/ig,            initialize: function initialize(options) {                if (options) {                    this.container = options.container;                }                this._initialize();                var self = this;                this.on('afterViewRender', function () {                    self.$('img').on('load', function () {                        var hasMoreThanOneSlider = (self.$('.slideshow-slider').children().length > 1);                        if (hasMoreThanOneSlider) {                            var speed = self.SPEED_MAP[Utils.trim(self.settings.custrecord_cct_ns_ss_transition_speed)];                            var auto = Utils.trim(self.settings.custrecord_cct_ns_ss_auto) === 'T';                            if (!self.$('.bx-wrapper').length) {                                self.sliderContainer = self.$('.slideshow-slider').bxSliderNew({                                    nextText: (Utils.isPhoneDevice() ? '' : '<a class="slideshow-next-icon"></a>'),                                    prevText: (Utils.isPhoneDevice() ? '' : '<a class="slideshow-prev-icon"></a>'),                                    touchEnabled: true,                                    auto: auto,                                    pager: true,                                    pause: speed                                });                            } else {                                if (self.sliderContainer) {                                    self.sliderContainer.redrawSlider();                                }                            }                        }                    });                });            },            install: function (settings, context_data) {                this._install(settings, context_data);                var promise = jQuery.Deferred();                return promise.resolve();            },            contextDataRequest: ['item'],            validateContextDataRequest: function validateContextDataRequest() {                return true;            },            getContext: function getContext() {                return {                    sectionHeight: Utils.isPhoneDevice() ? this.SECTION_HEIGHT_MAP[1] : this.SECTION_HEIGHT_MAP[this.settings.custrecord_cct_ns_ss_section_height],                    slideshowList: this.createSlideshowCollection().toJSON()                }            },            createSlideshowCollection: function () {                var slideshowCCTCollection = new SlideshowCCTCollection();                var slideshowNumbers = ['1', '2', '3', '4', '5', '6', '7', '8'];                for (var i = 0; i < slideshowNumbers.length; i++) {                    var slideshow = this.createSlideshow(slideshowNumbers[i]);                    if (!slideshow.isEmpty()) {                        slideshowCCTCollection.add(slideshow);                    }                }                return slideshowCCTCollection;            },            createSlideshow: function (itemNumber) {                return new SlideshowCCTModel({                    id: itemNumber,                    text: this.settings['custrecord_cct_ns_ss_text' + itemNumber],                    hasText: Utils.trim(this.settings['custrecord_cct_ns_ss_text' + itemNumber]).replace(this.HTML_TAGS_REGEX, '') !== '',                    imageURL: Utils.trim(this.settings['custrecord_cct_ns_ss_img' + itemNumber + '_url']),                    altText: Utils.trim(this.settings['custrecord_cct_ns_ss_alternative_text' + itemNumber]),                    imgAlignClass: this.IMG_ALIGN_MAP[this.settings['custrecord_cct_ns_ss_img_alignment' + itemNumber]],                    imgOverlayClass: this.IMG_OVERLAY_MAP[this.settings['custrecord_cct_ns_ss_img_overlay' + itemNumber]],                    opacityClass: !!this.IMG_OVERLAY_MAP[this.settings['custrecord_cct_ns_ss_img_overlay' + itemNumber]] ? 'image-opacity' : '',                    textAlignClass: this.TEXT_ALIGN_MAP[this.settings['custrecord_cct_ns_ss_text_alignment' + itemNumber]],                    textColorClass: this.TEXT_COLOR_MAP[this.settings['custrecord_cct_ns_ss_text_color' + itemNumber]],                    btnStyleClass: this.BTN_STYLE_MAP[this.settings['custrecord_cct_ns_ss_btn_style' + itemNumber]],                    btnText: Utils.trim(this.settings['custrecord_cct_ns_ss_btn_text' + itemNumber]),                    hasBtnText: !!Utils.trim(this.settings['custrecord_cct_ns_ss_btn_text' + itemNumber]),                    btnLink: Utils.trim(this.settings['custrecord_cct_ns_ss_btn_link' + itemNumber]),                    target: Utils.trim(this.settings['custrecord_cct_ns_ss_new_window' + itemNumber]) === 'T' ? '_blank' : '_self'                });            }        });    });