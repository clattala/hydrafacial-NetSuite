<section class="newslettercct-layout newslettercct-align-center newslettercct-{{layout}} {{#if bgimg_url}} newslettercct-background-image {{/if}} newslettercct-background clearfix" {{#if bgimg_url}} style="background-image: url('{{ bgimg_url }}');" {{/if}}>
  <div class="newslettercct-overlay">
    <form class="newslettercct-form" data-action="newsletter-signup" novalidate>
        <div class="newslettercct-container" data-validation="control-group">
            <h3 class="newslettercct-header">{{header}}</h3>
            <div class="newslettercct-subheader">{{{subHeader}}}</div>

            {{#if showFirstName}}
                <div class="newslettercct-input-group" data-input="firstName" data-validation="control-group">
                    <div class="fields-group-form-control" data-validation="control">
                      {{#if labelFirstName}}<label class="newslettercct-label">{{labelFirstName}}</label>{{/if}}
                        <input type="text"
                               class="newslettercct-input"
                               id="firstName"
                               name="firstName"
                               maxlength="32"
                               placeholder="{{firstName}}">
                    </div>
                </div>
            {{/if}}

            {{#if showLastName}}
                <div class="newslettercct-input-group" data-input="lastName" data-validation="control-group">
                    <div class="fields-group-form-control" data-validation="control">
                      {{#if labelLastName}}<label class="newslettercct-label">{{labelLastName}}</label>{{/if}}
                        <input type="text"
                               class="newslettercct-input"
                               id="lastName"
                               name="lastName"
                               maxlength="32"
                               placeholder="{{lastName}}">
                    </div>
                </div>
            {{/if}}

            {{#if showCompany}}
                <div class="newslettercct-input-group" data-input="company" data-validation="control-group">
                    <div class="fields-group-form-control" data-validation="control">
                      {{#if labelCompany}}<label class="newslettercct-label">{{labelCompany}}</label>{{/if}}
                        <input type="text"
                               class="newslettercct-input"
                               id="company"
                               name="company"
                               maxlength="32"
                               placeholder="{{company}}">
                    </div>
                </div>
            {{/if}}

            <div class="newslettercct-input-group" data-input="email" data-validation="control-group">
                <div class="fields-group-form-control" data-validation="control">
                  {{#if labelEmail}}<label class="newslettercct-label">{{labelEmail}}</label>{{/if}}
                    <input type="text"
                           class="newslettercct-input"
                           id="email"
                           name="email"
                           maxlength="254"
                           placeholder="{{email}}">
                </div>
            </div>

            <span class="newslettercct-button-container">
                    <button type="submit"
                            data-action="submit"
                            class="newslettercct-submit">{{buttonText}}
                    </button>
            </span>

            <div class="newsletter-alert-placeholder" data-type="alert-placeholder">
                {{#if isFeedback}}
                    <div data-view="GlobalMessageFeedback"></div>
                {{/if}}
            </div>

            {{#if hasLink}}
                <div>
                    <a class="newsletter-link" href="{{termsLink}}" target="_blank">{{termsLabel}}</a>
                </div>
            {{/if}}
        </div>
    </form>
  </div>
</section>

