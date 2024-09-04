{{!-- Edited for Posh Theme --}}

<div class="header-sidebar-wrapper">

	<div class="header-sidebar-menu-wrapper" data-type="header-sidebar-menu">

		<ul class="header-sidebar-menu">
		    {{#unless isStandalone}}
			{{#each categories}}
				{{#if text}}
					<li>
						<a {{objectToAtrributes this}} {{#if categories}}data-action="push-menu"{{/if}} name="{{text}}">
							{{text}}
							{{#if categories}}<i class="header-sidebar-menu-push-icon"></i>{{/if}}
						</a>
						{{#if categories}}
							<ul>
								<li>
									<a href="#" class="header-sidebar-menu-back" data-action="pop-menu" name="back-sidebar">
										<i class="header-sidebar-menu-pop-icon"></i>
										{{translate 'Back'}}
									</a>
								</li>

								<li>
									<a {{objectToAtrributes this}}>
										{{translate 'Browse $(0)' text}}
									</a>
								</li>

								{{#each categories}}
								<li>
									<a {{objectToAtrributes this}} {{#if categories}}data-action="push-menu"{{/if}}>
									{{text}}
									{{#if categories}}<i class="header-sidebar-menu-push-icon"></i>{{/if}}
									</a>

									{{#if categories}}
									<ul>
										<li>
											<a href="#" class="header-sidebar-menu-back" data-action="pop-menu">
												<i class="header-sidebar-menu-pop-icon"></i>
												{{translate 'Back'}}
											</a>
										</li>

										<li>
											<a {{objectToAtrributes this}}>
												{{translate 'Browse $(0)' text}}
											</a>
										</li>

										{{#each categories}}
										<li>
											<a {{objectToAtrributes this}} name="{{text}}">{{text}}</a>
										</li>
										{{/each}}
									</ul>
									{{/if}}
								</li>
								{{/each}}
							</ul>
						{{/if}}
					</li>
				{{/if}}
			{{/each}}
			{{/unless}}

			{{#if showExtendedMenu}}
				<li class="header-sidebar-menu-myaccount" data-view="Header.Menu.MyAccount"></li>
			{{/if}}

		</ul>

	</div>

	<div class="header-sidebar-links">
		{{#if extraHeaderView.socialMediaLinks}}
		<!-- This is not showing, will need work in the view -->
		<div class="header-sidebar-social">
			<ul class="header-sidebar-social-list">
			{{#each extraHeaderView.socialMediaLinks}}
				<li>
					<a {{objectToAtrributes item}} data-hashtag="{{datahashtag}}" data-touchpoint="{{datatouchpoint}}" data-target="{{datatarget}}">
						{{#if icon}}<i class="header-sidebar-social-icon icon-{{icon}}"></i>{{else}}{{text}}{{/if}}
					</a>
				</li>
			{{/each}}
			</ul>
		</div>
		{{/if}}

		<div class="header-sidebar-profile-menu" data-view="Header.Profile"></div>

		{{#if showExtendedMenu}}
		<a class="header-sidebar-user-logout" href="#" data-touchpoint="logout" name="logout">
			<i class="header-sidebar-user-logout-icon"></i>
			{{translate 'Sign Out'}}
		</a>
		{{/if}}

		<div data-view="QuickOrderHeaderLink"></div>
		<div data-view="RequestQuoteWizardHeaderLink"></div>

		{{#if showLanguages}}
		<div data-view="Global.HostSelector"></div>
		{{/if}}
		{{#if showCurrencies}}
		<div data-view="Global.CurrencySelector"></div>
		{{/if}}

	</div>

</div>



{{!----
Use the following context variables when customizing this template:

	categories (Array)
	showExtendedMenu (Boolean)
	showLanguages (Boolean)
	showCurrencies (Boolean)

----}}
