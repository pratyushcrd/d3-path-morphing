'use strict';

var rootElId = 'comaprison',
	rootEl = document.getElementById(rootElId),
	nameSpaceUri = 'http://www.w3.org/2000/svg',
	// Base configuration object
	config = {
		text: {
			d3: 'Animation with d3',
			plugin: 'Animation with plugin'
		},
		style: {
			text: {
				container: 'col col-md-12 lead'
			}
		},
		dataElClass: 'col col-md-3 col-lg-3',
		baseElClass: 'row'
	},
	i = 0,
	ii = dataAr.length;

// Function to create View for each path data
// depending whether its d3 or plugin's view
function createDataEl (data, type) {
	var baseDataEl = document.createElement('div'),
		elNames = ['text', 'start', 'end', 'anim'],
		containerOb = {},
		i = 0,
		ii = elNames.length,
		item = '',
		configureEl = function (el, elType) {
			var functionOb = { // functions based on each type
					text: function () {
						var textContainer = document.createElement('div'),
							text = document.createTextNode(config.text[type]);
						textContainer.setAttribute('class', config.style.text.container);
						textContainer.appendChild(text);
						el.appendChild(textContainer);
					},
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