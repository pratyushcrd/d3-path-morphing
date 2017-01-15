# d3-path-morphing

## Installing

Download the [latest release](https://github.com/pratyushcrd/d3/d3-path-morphing/build/d3-path-morphing.js).

## Demo
[Here](https://pratyushcrd.github.io/d3-path-morphing/)

## Usage

```javascript
d3.select('myPath')
.transition()
.duration(1000)
.attrTween('d', function () {
    var startPath = d3.select('#path1').attr('d'),
      endPath = d3.select('#path2').attr('d');
    return d3.morphPath(startPath, endPath);
});
```

### Credits:

 * [Red-raphael](https://github.com/fusioncharts/redraphael) & [Raphael-js](http://dmitrybaranovskiy.github.io/raphael) for Path2curve method
 * [FusionCharts](http://www.fusioncharts.com/) for redraphael
