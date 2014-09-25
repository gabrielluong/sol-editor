module.exports = {
	scripts: {
		vendor: [
			'vendor/signals/dist/signals.js',
			'vendor/tween.js/build/tween.min.js',
			'vendor/three.js/three.js',
			'vendor/jquery/dist/jquery.js',
			'vendor/angular/angular.js',
			'vendor/mousetrap/mousetrap.js',
			'vendor/bootstrap/dist/js/boostrap.js',
			'vendor/angular-ui-router/release/angular-ui-router.js',
			'vendor/angular-strap/dist/angular-strap.js',
			'vendor/angular-strap/dist/angular-strap.tpl.js',
			'vendor/angular-resource/angular-resource.js',
			'vendor/angular-cookies/angular-cookies.js',
			'vendor/ocLazyLoad/dist/ocLazyLoad.js'
		]
	},

	css: {
		vendor: [
			'vendor/bootstrap/dist/css/bootstrap.min.css',
			'vendor/jquery.layout/dist/layout-default-latest.css'
		]
	},

	less: {
		vendor: [
			''
		]
	},

	node_modules: [
		'node_modules/watchr/**/*',
		'node_modules/watch/**/*',
		'node_modules/github-download/**/*'
	]
}
