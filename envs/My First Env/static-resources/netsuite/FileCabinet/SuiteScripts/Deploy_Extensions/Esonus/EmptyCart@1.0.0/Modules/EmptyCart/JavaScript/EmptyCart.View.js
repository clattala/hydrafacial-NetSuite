define(
    'EmptyCart.View'
    , [
        'SCView',
        'EmptyCart.Helper',
        'empty_cart.tpl',
        'Utils',
        'jQuery',
        'underscore',
        'GlobalViews.Confirmation.View',
        'LiveOrder.Model'
    ]
    , function (
        SCViewModule,
        EmptyCartHelper,
        empty_cart_tpl,
        Utils,
        jQuery,
        _,
        GlobalViewsConfirmationView,
        LiveOrderModel
    ) {
        'use strict';

        var SCView = SCViewModule.SCView;

        function EmptyCartView(options) {
            SCView.call(this, options);
            this.template = empty_cart_tpl;
            this.application = options.application;
            this.cart = this.application.getComponent('Cart');
            this.layout = this.application.getComponent('Layout');
            this.emptyCartConfig = options.emptyCartConfig;
            this.emptyCartPromise = jQuery.Deferred();
            this.liveOrderModel = LiveOrderModel.getInstance();

            var self = this;
            this.emptyCartPromise.then(
                function () {
                    self.emptyCart();
                },
                function () {
                    self.emptyCartConfig.enableCartLoadingAnimation && EmptyCartHelper.fadeCart({ type: 'in' });

                    self.showMessage();
                }
            );
        }

        EmptyCartView.prototype = Object.create(SCView.prototype);
        EmptyCartView.prototype.constructor = EmptyCartView;

        EmptyCartView.prototype.getEvents = function () {
            return {
                'click [data-action="empty-cart"]': 'emptyCartPrompt'
            };
        };

        EmptyCartView.prototype.showMessage = function (message) {
            var msg;
            if (!message) {
                msg = 'Error emptying cart';
            }

            this.application.getComponent('Cart').showMessage({
                message: Utils.translate(msg),
                type: 'error',
                timeout: '5000'
            });
        };

        EmptyCartView.prototype.emptyCartPrompt = function (e) {
            if (this.emptyCartConfig.enableWarning) {
                var self = this;
                var confirmationView = new GlobalViewsConfirmationView({
                    title: 'Empty Cart',
                    body: self.emptyCartConfig.promptMessage,
                    class: 'quick-add-csv-empty-cart-confirm-buttons',
                    callBack: function emptyCartFn() {
                        self.emptyCartConfig.enableCartLoadingAnimation && EmptyCartHelper.fadeCart({ type: 'out', message: self.emptyCartConfig.cartUpdatingMessage });
                        self.emptyCartPromise.resolve();
                    },
                    autohide: true
                });
                self.layout.showContent(confirmationView, {
                    showInModal: true
                });
            } else {
                self.emptyCartConfig.enableCartLoadingAnimation && EmptyCartHelper.fadeCart({ type: 'out', message: self.emptyCartConfig.cartUpdatingMessage });
                self.emptyCartPromise.resolve();
            }
        };

        EmptyCartView.prototype.emptyCart = function () {
            // If we want to do this as an extension without touching the core at all, we need to iterate and remove each line
            var cart = this.cart;
            var self = this;

            jQuery.ajax({
                url:  Utils.getAbsoluteUrl(getExtensionAssetsPath('services/EmptyCart.Service.ss')),
                type: 'DELETE',
                success: function success(data) {
                    if(data.success) {
                        self.liveOrderModel.fetch()
                            .done(function done() {
                                self.emptyCartConfig.enableCartLoadingAnimation && EmptyCartHelper.fadeCart({ type: 'in' });
                            });
                    } else {
                        self.showMessage();
                    }
                },
                error: function failFn(data) {
                    self.showMessage();
                }
            });
        };

        EmptyCartView.prototype.getContext = function () {
            return {
                buttonLabel: Utils.translate(this.emptyCartConfig.buttonLabel || 'Empty Cart')
            };
        };

        return EmptyCartView;
    });
