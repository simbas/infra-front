import { ng } from '../ng-start';
import { http } from '../http';
import { $ } from '../libs/jquery/jquery';

export let bindHtml = ng.directive('bindHtml', function($compile){
	return {
		restrict: 'A',
		scope: {
			bindHtml: '='
		},
		link: function(scope, element){
			scope.$watch('bindHtml', function(newVal){
				var htmlVal = $('<div>' + (newVal || '') + '</div>')
				//Remove resizable attributes
				htmlVal.find('[resizable]').removeAttr('resizable').css('cursor', 'initial');
				htmlVal.find('[bind-html]').removeAttr('bind-html');
				htmlVal.find('[ng-include]').removeAttr('ng-include');
				htmlVal.find('[ng-transclude]').removeAttr('ng-transclude');
                htmlVal.find('[draggable]').removeAttr('draggable').css('cursor', 'initial');
                htmlVal.find('[contenteditable]').removeAttr('contenteditable');
				var htmlContent = htmlVal[0].outerHTML;
				if (!window.MathJax && !(window as any).MathJaxLoading) {
				    (window as any).MathJaxLoading = true;
                    http().loadScript('/infra/public/mathjax/MathJax.js').then(function () {
						(window as any).MathJaxLoading = false;
						window.MathJax.Hub.Config({
							messageStyle: 'none',
							tex2jax: { preview: 'none' },
							jax: ["input/TeX", "output/CommonHTML"],
							extensions: ["tex2jax.js", "MathMenu.js", "MathZoom.js"],
							TeX: {
								extensions: ["AMSmath.js", "AMSsymbols.js", "noErrors.js", "noUndefined.js"]
							}
						});
						window.MathJax.Hub.Typeset();
					});
                }
				element.html($compile(htmlContent)(scope.$parent));
				//weird browser bug with audio tags
				element.find('audio').each(function(index, item){
					var parent = $(item).parent();
					$(item)
						.attr("src", item.src)
                        .attr('preload', 'none')
						.detach()
						.appendTo(parent);
				});

				if(window.MathJax && window.MathJax.Hub){
					window.MathJax.Hub.Typeset();
				}
			});
		}
	}
});