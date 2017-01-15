'use strict';

var rootElId = 'comaprison',
	rootEl = document.getElementById(rootElId),
	nameSpaceUri = 'http://www.w3.org/2000/svg',
	// Base configuration object
	config = {
		animTime: 1500,
		text: {
			d3: 'Animation with d3',
			plugin: 'Animation with plugin'
		},
		style: {
			svg: {
				height: '1000',
				width: '1000'
			},
			text: {
				container: 'col col-md-12 lead'
			}
		},
		dataElClass: 'data-el col col-md-3 col-lg-3',
		baseElClass: 'row'
	},
	defaultStyle = {
		'stroke': '#6094de',
		'stroke-width': '2',
		'fill': 'none'
	},
	i = 0,
	ii = dataAr.length,
	setAttributes = function (el, ob) {
		var key;
		// return if not node element 
		// or empty style object
		if (!el || !el.setAttribute || !ob) {
			return;
		}
		// apply attributes
		for (key in ob) {
			el.setAttribute(key, ob[key])
		}
	},
	setStyles = function (el, ob) {
		var key;
		// return if not node element 
		// or empty style object
		if (!el || !el.style || !ob) {
			return;
		}
		// apply style
		for (key in ob) {
			el.style[key] = ob[key];
		}
	};

// Function to create View for each path data
// depending whether its d3 or plugin's view
function createDataEl (data, type) {
	var baseDataEl = document.createElement('div'),
		elNames = ['text', 'start', 'anim', 'end'],
		containerOb = {},
		i = 0,
		ii = elNames.length,
		item = '',
		configureEl = function (el, elType) {
			var sizeAdjust = function (refEl, el, sizeOb) {
					var refElSize = refEl.getBoundingClientRect(),
					// getting ratio
						x = refElSize.height / sizeOb.height,
						y = refElSize.width / sizeOb.width;
					console.log(x,y);
					el.style.transform = 'scale(' + x + ',' + y + ')';
				},
				functionOb = { // functions based on each type
					text: function () {
						var textContainer = document.createElement('div'),
							text = document.createTextNode(config.text[type]);
						textContainer.setAttribute('class', config.style.text.container);
						textContainer.appendChild(text);
						el.appendChild(textContainer);
					},
					start: function (isEnd) {
						var svg = document.createElementNS(nameSpaceUri, 'svg'),
							path = document.createElementNS(nameSpaceUri, 'path');
						// Setting svg dimensions
						svg.setAttribute('width', config.style.svg.width);
						svg.setAttribute('height', config.style.svg.height);
						// appending path to svg
						svg.appendChild(path);
						// setting initial style
						setStyles(path, defaultStyle);
						// setting custom styling
						setStyles(path, data.style);
						// setting actual path 'd'
						setAttributes(path, data.start);
						// if is endPath set Accordingly
						isEnd && setAttributes(path, data.end);
						// add svg to element
						el.appendChild(svg);
						return path;
					},
					end: function () {
						this.start(true);
					},
					anim: function () {
						var path = this.start(),
							time = config.animTime * 1.5,
							isReverse = false;
						setInterval(function () {
							time = config.animTime;
							type === 'd3' && d3.select(path)
								.transition()
								.duration(config.animTime)
						        .attr('d', !isReverse && data.end.d || data.start.d);
							type === 'plugin' && d3.select(path)
								.transition()
								.duration(config.animTime)
						        .attrTween('d', function () {
						        	if (isReverse) {
						        		return d3.morphPath(data.start.d, data.end.d);
						        	} else {
						        		return d3.morphPath(data.end.d, data.start.d);
						        	}
						        });
						    isReverse = !isReverse;
						}, time);

					}
				};
			// Setting class for each element
			el.setAttribute('class', config.dataElClass);
			// Invoking function for specific types
			functionOb[elType] && functionOb[elType]();
		};
	// Styling base
	baseDataEl.setAttribute('class', config.baseElClass);
	// Iterating for all element types
	for (i = 0; i < ii; ++i) {
		item = elNames[i];
		// Creating the element
		containerOb[item] = document.createElement('div');
		// Appending the current elements
		baseDataEl.appendChild(containerOb[item]);
		// Configuringthe element
		configureEl(containerOb[item], item);
	}
	return baseDataEl;
}

// Calling createDataEl for every data item
for (i = 0; i < ii; ++i) {
	rootEl.appendChild(createDataEl(dataAr[i], 'd3'));
	rootEl.appendChild(createDataEl(dataAr[i], 'plugin'));
}