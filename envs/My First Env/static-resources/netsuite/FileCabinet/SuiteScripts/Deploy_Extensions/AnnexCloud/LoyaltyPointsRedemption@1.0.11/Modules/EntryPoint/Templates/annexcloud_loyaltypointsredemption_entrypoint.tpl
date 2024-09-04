{{#if showModule}}
    <div class="order-wizard-pointsredemption-container">
        <div class="order-wizard-promocodeform">
            <div class="order-wizard-promocodeform-expander-head">
                <a class="order-wizard-promocodeform-expander-head-toggle" data-toggle="collapse" data-target="#order-wizard-points-redemption" aria-expanded="false" aria-controls="order-wizard-points-redemption">
                    <span class="order-wizard-promocodeform-header">
                        {{translate 'LINQ Rewards Points Redemption'}}
                    </span>
                    <i class="order-wizard-promocodeform-expander-toggle-icon"></i>
                </a>
            </div>
            <div class="order-wizard-promocodeform-expander-body collapse in" id="order-wizard-points-redemption"  data-type="points-redemption-container" data-action="show-points-redemption-container" aria-expanded="false" data-target="#order-wizard-points-redemption">
                <div class="order-wizard-pointsredemption-expander-container">
                    {{#if discountapplied}}
                        <div class="order-wizard-pointsredemption-text">
                            <span> {{translate 'You have just redeemed $(0) points on your order. Check order summary for applied discount.' pointsredeemed}} </span>
                            <span> {{translate 'You still have $(0) points available to redeem on future orders.' pointsleft}} </span>
                        </div>
                    {{else}}
                        <div class="order-wizard-pointsredemption-text">
                        <span>
                            {{translate 'You have a maximum of $(0) points available, worth $(1) in discounts. Important: your total discount amount cannot exceed your order subtotal.' userPointsFields.totalPoints userPointsFields.maxDiscount}}
                        </span>
                        </div>
                        <form class="checkout-promocode-form" data-action="redeem-points">
                            <div class="cart-promocode-form-summary-grid">
                                <div class="cart-promocode-form-summary-container-input">
                                    <div class="{{#if showErrorMessage}}error{{/if}}">
                                        <input
                                                {{#if isSaving}}disabled{{/if}}
                                                type="number"
                                                name="points"
                                                id="points"
                                                class="checkout-promocode-form-summary-input"
                                                placeholder="{{translate 'Points'}}"
                                                value="{{points}}"
                                                min="0"
                                        >
                                    </div>
                                </div>
                                <div class="cart-promocode-form-summary-promocode-container-button">
                                    <button type="submit" class="cart-promocode-form-summary-button-apply-promocode" {{#if isSaving}}disabled{{/if}}>
                                        {{translate 'Apply'}}
                                    </button>
                                </div>
                            </div>
                            <div data-type="pointsredemption-error-placeholder" class="pointsredemption-error-placeholder">
                                {{#if showErrorMessage}}
                                    <div data-view="GlobalsViewErrorMessage"></div>
                                {{/if}}
                            </div>
                        </form>
                    {{/if}}
                </div>
            </div>
        </div>
    </div>
{{/if}}
