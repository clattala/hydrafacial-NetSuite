{{#if showModule}}
    <div class="order-wizard-loyalty-container">
        <div class="order-wizard-loyalty">
            <h3 class="order-wizard-loyalty-header">
                {{translate 'Loyalty Rewards Points Redemption'}}
            </h3>
            <div class="order-wizard-loyalty-container">
                {{#if hasLoyaltyPromoApplied}}
                    <div class="order-wizard-pointsredemption-text">
                        <span> {{translate 'You have redeemed $(0) points on your order. Check order summary for applied discount.' pointsRedeemed}} </span>
                        <span> {{translate 'You still have $(0) points available to redeem on future orders.' pointsRemaining}} </span>
                    </div>
                {{else}}
                    <div class="order-wizard-pointsredemption-text">
                        <span>
                            {{translate 'You have a maximum of $(0) points available, worth $(1) in discounts. Important: your total discount amount cannot exceed your order subtotal.' loyaltyPoints.pointsBalance loyaltyPoints.pointsFormatted}}
                        </span>
                    </div>
                    <form class="order-wizard-loyalty-form">
                        <div class="order-wizard-loyalty-form-summary-grid">
                            <div class="order-wizard-loyalty-form-summary-container-input">
                                <div class="{{#if showErrorMessage}}error{{/if}}">
                                    <input {{#if isSaving}}disabled{{/if}} type="number" name="points" id="points" class="order-wizard-loyalty-form-summary-input" data-action="validate-points" placeholder="{{translate 'Points'}}" value="{{points}}" min="0" max="{{loyaltyPoints.pointsBalance}}" {{#if hasLoyaltyPromoApplied}}disabled{{/if}}>
                                </div>
                            </div>
                            <div class="order-wizard-loyalty-form-summary-loyalty-container-button">
                                <button type="submit" class="order-wizard-loyalty-button" data-action="redeem-points" {{#if isSaving}}disabled{{/if}} {{#if hasLoyaltyPromoApplied}}disabled{{/if}}>
                                    {{translate 'Apply'}}
                                </button>
                            </div>
                        </div>
                        <div data-type="pointsredemption-error-placeholder" class="pointsredemption-error-placeholder">
                            <div data-view="Loyalty.ErrorMessage"></div>
                        </div>
                    </form>
                {{/if}}
            </div>
        </div>
    </div>
{{/if}}
