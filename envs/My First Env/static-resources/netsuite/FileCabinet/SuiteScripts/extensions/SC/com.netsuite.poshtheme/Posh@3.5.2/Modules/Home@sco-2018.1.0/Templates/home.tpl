<div class="home">
	<div data-cms-area="home_cms_area_1" data-cms-area-filters="path"></div>

	<div class="home-slider-container">
		<div class="home-image-slider">
			<ul data-slider id="home-image-slider-list" class="home-image-slider-list">
                {{#if extraHomeView.isReady}}
				{{#if extraHomeView.showCarousel}}
				{{#each extraHomeView.carousel}}
                <li class="{{#if text}}caption-on{{/if}} {{#if title}}caption-on{{/if}} {{#if linktext}}caption-on{{/if}}">
                    <div class="home-slide-main-container
										{{#if imageBehaviour}}
											use-image
										{{else}}
											{{#if backgroundCrop}}
													{{backgroundCrop}}
											{{/if}}
										{{/if}}">
											{{#if isAbsoluteUrl}}
											<div class="home-slide-image-container use-image" style="background-image:url('{{image}}');">
												<a{{objectToAtrributes item}} class="home-slide-wrap-link">
													<img src="{{image}}" class="home-slide-image" />
												</a>
											</div>
											{{else}}
											<div class="home-slide-image-container
											{{#if imageBehaviour}}
												use-image
											{{else}}
												{{#if backgroundCrop}}
														{{backgroundCrop}}
												{{/if}}
											{{/if}}" style="background-image:url('{{getThemeAssetsPathWithDefault image 'img/posh-carousel-home-1.jpg'}}');">
												<a{{objectToAtrributes item}} class="home-slide-wrap-link">
													<img src="
															{{#if isAbsoluteUrl}}
																	{{image}}
															{{else}}
																	{{getThemeAssetsPathWithDefault image 'img/posh-carousel-home-1.jpg'}}
															{{/if}}"
															class="home-slide-image {{#if imageMobile}}hide-small{{/if}}" />
													{{#if imageMobile}}
														<img src="{{imageMobile}}" class="home-slide-image-mobile" />
													{{/if}}
												</a>
											</div>
											{{/if}}

											<div class="home-slide-caption-container {{#if isAbsoluteUrl}}carousel-center-box{{/if}} {{#if class}}{{class}}{{else}}carousel-center{{/if}} {{#if text}}caption-display{{/if}} {{#if title}}caption-display{{/if}} {{#if linktext}}caption-display{{/if}}">
												<div class="home-slide-caption {{captionTextAlign}}">
													{{#if title}}<h1 class="home-info-title" style="color:{{captionColor}}">{{title}}</h1>{{/if}}
													{{#if text}}<h2 class="home-info-text" style="color:{{captionColor}}">{{{text}}}</h2>{{/if}}
													{{#if linktext}}
														<div class="home-slide-caption-button-container">
															<a{{objectToAtrributes item}} class="home-slide-caption-button">{{#if text}}{{linktext}}{{else}}{{translate 'Shop now'}}{{/if}}</a>
														</div>
													{{/if}}
												</div>
											</div>
                    </div>
                </li>
                {{/each}}
				{{else}}
				{{#each carouselImages}}
					<li>
						<div class="home-slide-main-container
						{{#if imageBehaviour}}
							use-image
						{{else}}
							{{#if backgroundCrop}}
									{{backgroundCrop}}
							{{/if}}
						{{/if}}">
							<div class="home-slide-image-container">
								<img src="{{this}}" alt="" />
							</div>

							<div class="home-slide-caption">
								<h2 class="home-slide-caption-title">SAMPLE HEADLINE</h2>
								<p>Example descriptive text displayed on multiple lines.</p>
								<div class="home-slide-caption-button-container">
									<a href="/search" class="home-slide-caption-button">Shop Now</a>
								</div>
							</div>
						</div>
					</li>
				{{/each}}
				{{/if}}
                {{/if}}
			</ul>
		</div>
	</div>

	<!-- <div class="separator-line"><div class="separator-box"></div></div> -->

	<!-- CMS ZONE -->
	<div data-cms-area="home_cms_area_2" data-cms-area-filters="path"></div>

    <!-- CMS MERCHANDISING ZONE -->
    <div class="home-merchandizing-zone">
        <div class="home-merchandizing-zone-content">
            <div data-cms-area="home_merchandizing_zone" data-cms-area-filters="path"></div>
        </div>
    </div>


	<!-- Promo Area -->
	{{#if extraHomeView.promo}}
	<div class="home-promo">
		<div class="home-promo-image"{{#if extraHomeView.promo.image}} style="background-image:url('{{getThemeAssetsPathWithDefault extraHomeView.promo.image 'img/posh-freetextimage.jpg'}}');"{{/if}}>{{#if extraHomeView.promo.image}}<img src="{{getThemeAssetsPathWithDefault extraHomeView.promo.image 'img/posh-freetextimage.jpg'}}" />{{/if}}</div>
		<div class="home-promo-text">
			<div class="home-promo-text-content">
				{{#if extraHomeView.promo.title}}<h1>{{extraHomeView.promo.title}}</h1>{{/if}}
			    {{#if extraHomeView.promo.subtitle}}<h2>{{extraHomeView.promo.subtitle}}</h2>{{/if}}
			    <div class="separator-line"><div class="separator-box"></div></div>
				{{#if extraHomeView.promo.text}}{{{extraHomeView.promo.text}}}{{/if}}
				{{#if extraHomeView.promo.linklocation}}
					<a href="{{extraHomeView.promo.linklocation}}">{{#if extraHomeView.promo.linktext}}{{extraHomeView.promo.linktext}}{{else}}{{translate 'Learn More'}}{{/if}}</a>
				{{/if}}
			</div>
		</div>
	</div>
	{{/if}}

	<!-- CMS ZONE -->
    <div data-cms-area="home_cms_area_3" data-cms-area-filters="path"></div>

	<!-- INFOBLOCKS -->
	{{#if extraHomeView.showInfoblocks}}
	<div class="home-infoblock-layout">
		{{#each extraHomeView.infoBlocks}}
		<div class="home-infoblock{{#if span}} home-infoblock-span2{{/if}}">
			<a{{objectToAtrributes item}} class="home-infoblock-link">
				<img class="home-infoblock-image" src="{{getThemeAssetsPathWithDefault image}}" alt="{{title}}" />
				{{#if title}}<div class="home-infoblock-text">{{title}}</div>{{/if}}
			</a>
		</div>
		{{/each}}
	</div>
	{{/if}}

    <!-- CMS ZONE -->
	<div data-cms-area="home_cms_area_4" data-cms-area-filters="path"></div>

</div>

{{!----
Use the following context variables when customizing this template:

	imageHomeSize (String)
	imageHomeSizeBottom (String)
	carouselImages (Array)
	bottomBannerImages (Array)

----}}

