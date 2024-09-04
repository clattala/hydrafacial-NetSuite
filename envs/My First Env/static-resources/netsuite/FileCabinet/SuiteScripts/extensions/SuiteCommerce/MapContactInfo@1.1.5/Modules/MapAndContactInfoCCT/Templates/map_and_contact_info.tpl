<section class="mapcontactinfocct-container">
    {{#if hasHeader}}
        <h3 class="header-container">{{{header}}}</h3>
    {{/if}}
	<div class="content mapcontactinfoCCT {{backgroundClass}}">
	    {{#if mapPositionLeft}}
            {{#if hasMapUrl}}
                <div class="map-container {{mapAloneClass}}">{{{mapUrl}}}</div>
            {{/if}}
		{{/if}}
		{{#if hasAnyContact}}
            <div class="contactinfo-container {{backgroundClass}} {{singleColumnWidthClass}} {{#if mapPositionLeft}} float-right-class {{/if}}">
                {{#if hasContact}}
                    <div class="address-contact-container">{{{contact}}}</div>
                {{/if}}
                <div class="buttons-container-small-screen">
                    {{#if hasPhone}}
                        <a class="button-class-small-screen" href="tel:{{{phone}}}">
                            <span class="map-contact-cct-icon-phone {{hideIconsClass}}">
                             <i></i>
                            </span>{{{phoneButtonText}}}
                        </a>
                    {{/if}}
                    {{#if hasEmail}}
                        <a class="button-class-small-screen" href="mailto:{{{email}}}">
                            <span class="map-contact-cct-icon-envelope {{hideIconsClass}}">
                             <i></i>
                            </span>{{{emailButtonText}}}
                        </a>
                    {{/if}}
                </div>
              <div class="buttons-container-big-screen {{singleColumnCenterAlignmentClass}}">
                {{#if hasPhone}}
                  <div class="button-class-big-screen">
                        <span class="map-contact-cct-icon-phone {{hideIconsClass}}">
                          <i></i>
                        </span>
                    <a href="tel:{{{phone}}}"><p><strong>{{{phone}}}</strong></p></a>
                  </div>
                {{/if}}
                {{#if hasEmail}}
                  <div class="button-class-big-screen">
                       <span class="map-contact-cct-icon-envelope {{hideIconsClass}}">
                             <i></i>
                            </span>
                    <a href="mailto:{{{email}}}"><p><strong>{{{email}}}</strong></p></a>
                  </div>
                {{/if}}
              </div>
            </div>
        {{/if}}
	    {{#unless mapPositionLeft}}
            {{#if hasMapUrl}}
                <div class="map-container float-right-class {{mapAloneClass}}">{{{mapUrl}}}</div>
            {{/if}}
		{{/unless}}
  </div>
</section>



