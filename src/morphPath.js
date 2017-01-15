export default function (p1, p2) {
	var path1 = p1,
		path2 = p2,
		diff = getDiff(path1, path2),
		i = 0,
		ii = 0,
		now = [];
	path1 = diff[0];
	path2 = diff[1];
	diff = diff[2];
  return function (pos) {
  	now = [];
    for (var i = 0, ii = path1.length; i < ii; i++) {
        now[i] = [path1[i][0]];
        var jj;
        jj = path1[i] ? path1[i].length : 0;
        for (var j = 1  ; j < jj; j++) {
            now[i][j] = (+path1[i][j] + pos * diff[i][j]);
        }
        now[i] = now[i].join(' ');
    }
    return now.join(' ');
  }
};

function getDiff (p1, p2) {
	var toPath = [],
		fromPath = [],
		i = 0,
		ii = 0,
	    pathComb = path2curve(p1, p2),
	    diffPath;
	pathComb = pathNormalizer(pathComb[0], pathComb[1]);
	toPath = pathComb[1];
	fromPath = pathComb[0];
	diffPath = [];
	for (i = 0, ii = fromPath.length; i < ii; i++) {
	    diffPath[i] = [0];
	    var jj;
	    jj = fromPath[i] ? fromPath[i].length : 0;
	    for (var j = 1; j < jj; j++) {
	        diffPath[i][j] = (toPath[i][j] - fromPath[i][j]);
	    }
	}
	return [fromPath, toPath, diffPath]
}

function pathNormalizer(p1, p2) {
    // Function to convert array to svg path (?) only for curves
    var finalp1 = [],
        finalp2 = [],
        pathArr1 = toSvgPath(p1),
        pathArr2 = toSvgPath(p2),
        i = 0,
        ii = 0,
        temp,
        createElementNS = document.createElementNS && document.createElementNS.bind(document),
        dPath = createElementNS && createElementNS("http://www.w3.org/2000/svg", "path");

    // If path invalid or svg not supported return
    if (!pathArr1 || !pathArr2 || !dPath) {
        return [p1, p2];
    }
    if (canFallback(p1, p2)) {
        return [p1, p2];
    }
    // If any of the parameters is
    // absent return to normal flow
    if (!p1 || !p2) {
        return [p1, p2];
    }
    // If svg not available return to normal flow
    if (!document.createElementNS) {
        return [p1, p2];
    }
    // Setting path again
    pathArr1 = toSvgPath(p1);
    pathArr2 = toSvgPath(p2);
    if(pathArr1.join().indexOf('undefined') !== -1) {
        return [p1, p2];
    }
    if(pathArr2.join().indexOf('undefined') !== -1) {
        return [p1, p2];
    }
    // If svg functions not available return to normal flow
    if (!dPath.getTotalLength || !dPath.getPointAtLength) {
        return [p1, p2];
    }

    function canFallback (path1, path2) {
        var str1 = '',
            str2 = '',
            testLen,
            testPoint;
        // Checking path totoalLength is accurate or not
        // testing with a known path
        // this check is for Firefox
        dPath.setAttribute('d', 'M300 10 L300 300 C50 310,50 640,350 650' +
            'C600 640,600 310,400 300 L400 10 L295 10');
        testLen = dPath.getTotalLength();
        testPoint = dPath.getPointAtLength(10);
        if (testLen < 1829.1 || testLen > 1829.2) {
            return true;
        }
        if (Math.round(testPoint.x) !== 300 || Math.round(testPoint.y) !== 20) {
            return true;
        }
        // path1 and path2 are in array
        function trimPathArray (arr) {
            var i = arr.length;
            while (i--) {
                if (arr[i].join('') === arr[i - 1].join('')) {
                    arr.pop();
                } else {
                    break;
                }
            }
        }
        function getPathFromArray(arr) {
            var str = '',
                i = 0,
                ii = arr.length;
            for (; i < ii; ++i) {
                str += arr[i].join(' ');
            }
            return str;
        }
        trimPathArray(path1);
        trimPathArray(path2);
        str1 = getPathFromArray(path1);
        str2 = getPathFromArray(path2);
        if (str1.split(/[Mm]/).length > 2 || str2.split(/[Mm]/).length > 2) {
            return false;
        }
        if (path1.length === path2.length) {
            return true;
        }
        return false;
    }

    function toSvgPath(arr) {
        var str = [],
            i = 0,
            ii = arr.length,
            item = [];
        if (typeof arr === 'string') {
            return arr;
        }
        // Converting the array to string; path type
        for (i = 0; i < ii; ++i) {
            if (!arr[i].join){
                return;
            } else {
                // Removing continuous Move commands
                // Picking up the last one
                if ( !i || !arr[i + 1] || arr[i + 1][0] !== 'M' || arr[i][0] !== 'M'){
                    str.push(arr[i].join(' '));
                }
            }
        }
        str = str.join('');
        str = str.split(/[Mm]/).slice(1);
        for (i = 0, ii = str.length; i < ii; ++i) {
            str[i] = 'M' + str[i];
        }
        return str;
    }

    ii = Math.max(pathArr1.length, pathArr2.length);
    for (i = 0; i < ii; ++i) {
        temp = _pathNormalizer(pathArr1[i], pathArr2[i]);
        pathArr1[i] = temp[0];
        pathArr2[i] = temp[1];
    }

    function linetopath (arr) {
        var i = 0,
            ii = 0,
            str = [];
        arr = arr || [];
        ii = arr.length;
        for (i = 0; i < ii; ++i) {
            if (arr[i].length - 1) {
                str.push(arr[i].join(' '));
            }
        }
        return str.join('');
    }

    function removeBlanks (arr) {
        var i = arr.length,
            j = 0,
            path;
        while (i-- - 1) {
            // Pop if length is zero
            if (arr[i].toString() === arr[i - 1].toString()) {
                arr.pop();
            }
        }
    }

    function _divide(arr, times) {
        var resArr = [],
            locArr = [],
            arrLen = arr.length,
            i = 0,
            ii = 0,
            x = 0,
            prevPos = 0,
            y = 0,
            diffTimes = times - arrLen; // If array size is smaller than
                                        // divisions needed
        while (diffTimes >= 0) {
            i = arr.length - 1;
            arr.push(arr.slice(i));
            --diffTimes;
        }
        arrLen = arr.length;
        for (i = 0; i <= times; ++i) {
            locArr.push(Math.round((i / times) * arrLen));
        }
        for (i = 0, ii = locArr.length - 1; i < ii; ++i) {
            resArr.push(arr.slice(locArr[i], locArr[i + 1]));
            if (resArr[i][0][0] !== 'M' && resArr[i][0][0] !== 'm') {
                prevPos = resArr[i - 1].length - 1;
                x = resArr[i - 1][prevPos][1];
                y = resArr[i - 1][prevPos][2];
                resArr[i].unshift(['M', x, y]);
            }
        }
        return resArr;
    }

    function divideArray (diff) {
        var arrToDivide = [],
            countArr = [],
            transArr = [],
            i = 0,
            ii = 0,
            isArr1 = true;
        if (diff === 0) {
            return;
        } else if (diff > 0) {
            arrToDivide = pathArr2;
            isArr1 = false;
        } else {
            diff = -diff;
            arrToDivide = pathArr1;
        }
        for (i = 0, ii = arrToDivide.length; i < ii; ++i) {
            countArr.push(1);
        }
        while (diff--) {
            --i;
            if (i < 0) {
                i = ii - 1;
            }
            countArr[i]++;
        }

        for (i = 0; i < ii; ++i){
            if (countArr[i] === 1) {
                transArr.push(arrToDivide[i]);
            } else {
                transArr.push.apply(transArr, _divide(arrToDivide[i], countArr[i]));
            }
        }
        if (isArr1) {
            pathArr1 = transArr;
        } else {
            pathArr2 = transArr;
        }
    }
    /*

    */
    removeBlanks(pathArr1);
    removeBlanks(pathArr2);
    divideArray(pathArr1.length - pathArr2.length);

    ii = Math.max(pathArr1.length, pathArr2.length);
    for (i = 0; i < ii; ++i) {
        temp = _pathNormalizer(linetopath(pathArr1[i]), linetopath(pathArr2[i]));
        pathArr1[i] = temp[0];
        pathArr2[i] = temp[1];
    }

    for (i = 0, ii = pathArr1.length; i < ii; ++i) {
        finalp1 = finalp1.concat(pathArr1[i]);
    }
    for (i = 0, ii = pathArr2.length; i < ii; ++i) {
        finalp2 = finalp2.concat(pathArr2[i]);
    }
    return [finalp1, finalp2];
}
// A function to calculate common path
// in two given paths
function commonPathCalculator (p1, p2) {
    var i = 0,
        j = 0,
        ii = 0,
        jj = 0,
        k = 0,
        kk = 0,
        uncommon1 = 0,
        uncommon2 = 0,
        lim1 = 0,
        lim2 = 0,
        map1 = {},
        map2 = {},
        groupedPath1 = [],
        groupedPath2 = [],
        gpIndex1 = -1,
        gpIndex2 = -1,
        isSame = true,
        nearestPoint1,
        nearestPoint2;
    // Splitting the string commands to get
    // particular points later
    // Will be required while breaking paths
    // into common and uncommon parts
    function splitter (path) {
        var i = 0,
            ii = 0;
        path = path.split(/[MCLmcl]/).slice(1);
        for (i = 0, ii = path.length; i < ii; ++i) {
            path[i] = path[i].split(' ').slice(1);
            i || path[i].unshift('M');
            if (i) {
                path[i].length === 2 && path[i].unshift('L') || path[i].unshift('C');
            }
        }
        return path;
    }
    // populate the arr to object in reverse manner
    // i.e value to key mapping
    function mapper (arr, ob) {
        var i = 0,
            ii = arr.length,
            val,
            item;
        for (i = 0, ii = arr.length; i < ii; ++i) {
            val = arr[i].join(' ');
            item = arr[i];
            if (item[0] === 'C' && item[3] === item[5] && item[4] === item[6]) {
                arr[i].stringValue = ['L', item[3], item[4]].join(' ');
            } else
            item.stringValue = val;
            // Creating an array if undefined
            // pushing otherwise
            ob[item.stringValue] && ob[item.stringValue].push(i);
            ob[item.stringValue] || (ob[item.stringValue] = [i]);
        }
    }
    // Function to get nearest point that exist
    // in the other array
    function getNearestExistingPoint (arr, map, start, ii, lim) {
        var i = start,
            k = 0,
            kk = 0,
            item;
        for (; i < ii; ++i) {
            item = map[arr[i].stringValue];
            if (item) {
                for (k = 0, kk = item.length; k < kk; ++k) {
                    if (item[k] >= lim) {
                        return {
                            index : i,
                            mapValue : item[k],
                            diff : i - start
                        };
                    }
                }
            }
        }
        return -1;
    }
    // function to get last coordinate for CurveTo command
    function getCoordinateAsMove (arr) {
        var last = arr.length - 1;
        return ['M', arr[last - 1], arr[last]].join(' ');
    }
    // function to conver path array to string
    function pathToString (arr) {
        return arr.join('');
    }
    // commonPathCalculator flow here
    p1 = splitter(p1);
    p2 = splitter(p2);
    mapper(p1, map1);
    mapper(p2, map2);
    // Setting length
    ii = p1.length;
    jj = p2.length;
    i = 0;
    j = 0;
    // Making partitions for common
    // and uncommon parts
    // Checking if first is common or uncommon
    while (i < ii && j < jj) {
        ++gpIndex1;
        ++gpIndex2;
        // initializing blank arrays
        groupedPath1[gpIndex1] = [];
        groupedPath2[gpIndex2] = [];
        isSame = (p1[i].stringValue === p2[j].stringValue);
        if (i) {
            // Logic to push prev coordinate as move command
            groupedPath1[gpIndex1].push(getCoordinateAsMove(p1[i - 1]));
            groupedPath2[gpIndex2].push(getCoordinateAsMove(p2[j - 1]));
        }
        if (isSame) {
            while (i < ii && j < jj && p1[i].stringValue === p2[j].stringValue) {
                groupedPath1[gpIndex1].push(p1[i].stringValue);
                groupedPath2[gpIndex2].push(p2[j].stringValue);
                ++i;
                ++j;
            }
        } else {
            nearestPoint1 = getNearestExistingPoint(p1, map2, i, ii, j);
            nearestPoint2 = getNearestExistingPoint(p2, map1, j, jj, i);
            // Assuming nearestPoint1 is nearer than nearestPoint2
            lim1 = nearestPoint1.index;
            lim2 = nearestPoint1.mapValue;
            // If nearestPoint2 is nearer
            if (!~nearestPoint1 || nearestPoint1.diff > nearestPoint2.diff) {
                lim1 = nearestPoint2.mapValue;
                lim2 = nearestPoint2.index;
            }
            if (!~nearestPoint1 && !~nearestPoint2) {
               // If both not found include all as uncommon
                lim1 = ii - 1;
                lim2 = jj - 1;
            }
            // Pushing uncommon paths
            while (i <= lim1) {
                groupedPath1[gpIndex1].push(p1[i].stringValue);
                ++i;
            }
            while (j <= lim2) {
                groupedPath2[gpIndex2].push(p2[j].stringValue);
                ++j;
            }
        }
        groupedPath1[gpIndex1] = pathToString(groupedPath1[gpIndex1]);
        groupedPath2[gpIndex2] = pathToString(groupedPath2[gpIndex2]);
    }
    // If Any one is left add them all
    if (i < ii) {
        ++gpIndex1;
        groupedPath1[gpIndex1] = [];
        groupedPath1[gpIndex1].push(getCoordinateAsMove(p1[i - 1]));
        ++gpIndex2;
        groupedPath2[gpIndex2] = [];
        groupedPath2[gpIndex2].push(getCoordinateAsMove(p2[j - 1]));
        while(i < ii) {
            groupedPath1[gpIndex1].push(p1[i].stringValue);
            ++i;
        }
        groupedPath1[gpIndex1] = pathToString(groupedPath1[gpIndex1]);
    }
    if (j < jj) {
        ++gpIndex1;
        groupedPath1[gpIndex1] = [];
        groupedPath1[gpIndex1].push(getCoordinateAsMove(p1[i - 1]));
        ++gpIndex2;
        groupedPath2[gpIndex2] = [];
        groupedPath2[gpIndex2].push(getCoordinateAsMove(p2[j - 1]));
        while(j < jj) {
            groupedPath2[gpIndex2].push(p2[j].stringValue);
            ++j;
        }
        groupedPath2[gpIndex2] = pathToString(groupedPath2[gpIndex2]);
    }
    return [groupedPath1, groupedPath2];
}

// function to get equal points for two different path
function _pathNormalizer(p1, p2) {
    var i = 0,
        j = 0,
        ii = 0,
        jj = 0,
        item = {},
        fPath1 = [],
        fPath2 = [],
        divisions = 0,
        commonPath,
        tmp;
    // Uncommon path normalizer
    function normalizeUncommonPaths (p1, p2) {
        var dPath1,
            dPath2,
            i = 0,
            j = 0,
            item = {},
            pathLen1 = 0,
            pathLen2 = 0,
            fPath1 = [],
            fPath2 = [],
            divisions = 0,
            round = Math.round;
        // Creating path elements to use functions 'getTotalLength'
        // and 'getPointAtLength'
        dPath1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        dPath1.setAttribute("d", p1);

        dPath2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        dPath2.setAttribute("d", p2);

        // Getting length of the paths
        pathLen1 = dPath1.getTotalLength();
        pathLen2 = dPath2.getTotalLength();

        // Number of divisions will depend on larger path
        divisions = 0.15 * Math.max(pathLen1, pathLen2);
        divisions = Math.ceil(divisions);

        if (!divisions || !isFinite(divisions) || divisions < 10) {
            divisions = 10;
        }

        for (i = 0; i <= divisions; ++i) {
            item = dPath1.getPointAtLength((i / divisions) * pathLen1);
            fPath1.push([i ? "L" : "M",
                round(item.x),
                round(item.y)
            ]);
            item = dPath2.getPointAtLength((i / divisions) * pathLen2);
            fPath2.push([i ? "L" : "M",
                round(item.x),
                round(item.y)
            ]);
        }
        return [fPath1, fPath2];
    }
    if (!p1 || p1 === 'M  ') {
        p1 = p2.split(' ').slice(0, 3).join(' ').replace('L', '');
    }
    if (!p2 || p2 === 'M  ') {
        p2 = p1.split(' ').slice(0, 3).join(' ').replace('L', '');
    }
    commonPath = commonPathCalculator(p1, p2);

    for (i = 0, ii = commonPath[0].length; i < ii; ++i) {
        tmp = normalizeUncommonPaths(commonPath[0][i], commonPath[1][i]);
        if (i) {
            fPath1 = fPath1.concat(tmp[0].slice(1));
            fPath2 = fPath2.concat(tmp[1].slice(1));
        } else {
            fPath1 = fPath1.concat(tmp[0]);
            fPath2 = fPath2.concat(tmp[1]);
        }
    }
    return [fPath1, fPath2];
}
// Convert path string to array
function path2array (str) {
	var arr = str.split(/(?=[LMC])/),
		i = 0,
		ii = arr.length,
		j = 0,
		jj = 0,
		temp = [],
		item = '';
	for (; i < ii; ++i) {
		if (/[zZ]/.test(arr[i]) && arr[i].length - 1) {
			arr.splice(i + 1, 0, 'Z');
			++ii;
		}
	}
	for (i = 0; i < ii; ++i) {
		item = arr[i];
		if (item.length === 1) {
			continue;
		}
		temp = item.substr(1).split(',');
		temp.unshift(item[0]);
		for (j = 1, jj = temp.length; j < jj; ++j) {
			temp[j] = parseFloat(temp[j]);
		}
		arr[i] = temp;
	}
	return arr;
}

function path2curve(path, path2) {
    var p = pathToAbsolute(path),
    p2 = pathToAbsolute(path2),
    mmax = Math.max,
    concat = 'concat',
    attrs = {
        x: 0,
        y: 0,
        bx: 0,
        by: 0,
        X: 0,
        Y: 0,
        qx: null,
        qy: null
    },
    attrs2 = {
        x: 0,
        y: 0,
        bx: 0,
        by: 0,
        X: 0,
        Y: 0,
        qx: null,
        qy: null
    },
    processPath = function(path, d) {
        var nx, ny;
        if (!path) {
            return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
        }
        !(path[0] in {
            T: 1,
            Q: 1
        }) && (d.qx = d.qy = null);
        switch (path[0]) {
            case "M":
                d.X = path[1];
                d.Y = path[2];
                break;
            case "A":
                // arc not supported yet
                // path = ["C"][concat](a2c[apply](0, [d.x, d.y][concat](path.slice(1))));
                break;
            case "S":
                nx = d.x + (d.x - (d.bx || d.x));
                ny = d.y + (d.y - (d.by || d.y));
                path = ["C", nx, ny][concat](path.slice(1));
                break;
            case "T":
                d.qx = d.x + (d.x - (d.qx || d.x));
                d.qy = d.y + (d.y - (d.qy || d.y));
                path = ["C"][concat](q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
                break;
            case "Q":
                d.qx = path[1];
                d.qy = path[2];
                path = ["C"][concat](q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
                break;
            case "L":
                path = ["C"][concat](l2c(d.x, d.y, path[1], path[2]));
                break;
            case "H":
                path = ["C"][concat](l2c(d.x, d.y, path[1], d.y));
                break;
            case "V":
                path = ["C"][concat](l2c(d.x, d.y, d.x, path[1]));
                break;
            case "Z":
                path = ["C"][concat](l2c(d.x, d.y, d.X, d.Y));
                break;
        }
        return path;
    },
    fixArc = function(pp, i) {
        if (pp[i].length > 7) {
            pp[i].shift();
            var pi = pp[i];
            while (pi.length) {
                pp.splice(i++, 0, ["C"][concat](pi.splice(0, 6)));
            }
            pp.splice(i, 1);
            ii = mmax(p.length, p2 && p2.length || 0);
        }
    },
    fixM = function(path1, path2, a1, a2, i) {
        if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
            path2.splice(i, 0, ["M", a2.x, a2.y]);
            a1.bx = 0;
            a1.by = 0;
            a1.x = path1[i][1];
            a1.y = path1[i][2];
            ii = mmax(p.length, p2 && p2.length || 0);
        }
    };
    for (var i = 0, ii = mmax(p.length, p2 && p2.length || 0); i < ii; i++) {
        p[i] = processPath(p[i], attrs);
        fixArc(p, i);
        p2 && (p2[i] = processPath(p2[i], attrs2));
        p2 && fixArc(p2, i);
        fixM(p, p2, attrs, attrs2, i);
        fixM(p2, p, attrs2, attrs, i);
        var seg = p[i],
        seg2 = p2 && p2[i],
        seglen = seg.length,
        seg2len = p2 && seg2.length;
        attrs.x = seg[seglen - 2];
        attrs.y = seg[seglen - 1];
        attrs.bx = parseFloat(seg[seglen - 4]) || attrs.x;
        attrs.by = parseFloat(seg[seglen - 3]) || attrs.y;
        attrs2.bx = p2 && (parseFloat(seg2[seg2len - 4]) || attrs2.x);
        attrs2.by = p2 && (parseFloat(seg2[seg2len - 3]) || attrs2.y);
        attrs2.x = p2 && seg2[seg2len - 2];
        attrs2.y = p2 && seg2[seg2len - 1];
    }
    return [p, p2];
}
function pathToAbsolute (pathArray) {
    var res,
    pathArray = parsePathString(pathArray),
    concat = 'concat';
    if (!pathArray || !pathArray.length) {
        res = [["M", 0, 0]];
        return res;
    }
    var x = 0,
        y = 0,
        mx = 0,
        my = 0,
        start = 0;
    res = [];
    if (pathArray[0][0] == "M") {
        x = +pathArray[0][1];
        y = +pathArray[0][2];
        mx = x;
        my = y;
        start++;
        res[0] = ["M", x, y];
    }
    var crz = pathArray.length == 3 && pathArray[0][0] == "M" && pathArray[1][0].toUpperCase() == "R" && pathArray[2][0].toUpperCase() == "Z";
    for (var r, pa, i = start, ii = pathArray.length; i < ii; i++) {
        res.push(r = []);
        pa = pathArray[i];
        if (pa[0] != String.prototype.toUpperCase.call(pa[0])) {
            r[0] = String.prototype.toUpperCase.call(pa[0]);
            switch (r[0]) {
                case "A":
                    r[1] = pa[1];
                    r[2] = pa[2];
                    r[3] = pa[3];
                    r[4] = pa[4];
                    r[5] = pa[5];
                    r[6] = +(pa[6] + x);
                    r[7] = +(pa[7] + y);
                    break;
                case "V":
                    r[1] = +pa[1] + y;
                    break;
                case "H":
                    r[1] = +pa[1] + x;
                    break;
                case "R":
                    var dots = [x, y][concat](pa.slice(1));
                    for (var j = 2, jj = dots.length; j < jj; j++) {
                        dots[j] = +dots[j] + x;
                        dots[++j] = +dots[j] + y;
                    }
                    res.pop();
                    res = res[concat](catmullRom2bezier(dots, crz));
                    break;
                case "M":
                    mx = +pa[1] + x;
                    my = +pa[2] + y;
                default:
                    for (j = 1, jj = pa.length; j < jj; j++) {
                        r[j] = +pa[j] + ((j % 2) ? x : y);
                    }
            }
        } else if (pa[0] == "R") {
            dots = [x, y][concat](pa.slice(1));
            res.pop();
            res = res[concat](catmullRom2bezier(dots, crz));
            r = ["R"][concat](pa.slice(-2));
        } else {
            for (var k = 0, kk = pa.length; k < kk; k++) {
                r[k] = pa[k];
            }
        }
        switch (r[0]) {
            case "Z":
                x = mx;
                y = my;
                break;
            case "H":
                x = r[1];
                break;
            case "V":
                y = r[1];
                break;
            case "M":
                mx = r[r.length - 2];
                my = r[r.length - 1];
            default:
                x = r[r.length - 2];
                y = r[r.length - 1];
        }
    }
    return res;
}
function parsePathString (pathString) {
    var pathCommand = /([achlmrqstvz])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/ig,
        pathValues = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/ig,
        concat = 'concat';
        
    if (!pathString) {
        return null;
    }

    var paramCounts = {
        a: 7,
        c: 6,
        h: 1,
        l: 2,
        m: 2,
        r: 4,
        q: 4,
        s: 4,
        t: 2,
        v: 1,
        z: 0
    },
    data = [];
    if (!data.length) {
        String(pathString).replace(pathCommand, function(a, b, c) {
            var params = [],
            name = b.toLowerCase();
            c.replace(pathValues, function(a, b) {
                b && params.push(+b);
            });
            if (name == "m" && params.length > 2) {
                data.push([b][concat](params.splice(0, 2)));
                name = "l";
                b = b == "m" ? "l" : "L";
            }
            if (name == "r") {
                data.push([b][concat](params));
            } else
                while (params.length >= paramCounts[name]) {
                    data.push([b][concat](params.splice(0, paramCounts[name])));
                    if (!paramCounts[name]) {
                        break;
                    }
                }
        });
    }
    return data;
};
function l2c(x1, y1, x2, y2) {
    return [x1, y1, x2, y2, x2, y2];
}
function q2c(x1, y1, ax, ay, x2, y2) {
    var _13 = 1 / 3,
    _23 = 2 / 3;
    return [
    _13 * x1 + _23 * ax,
    _13 * y1 + _23 * ay,
    _13 * x2 + _23 * ax,
    _13 * y2 + _23 * ay,
    x2,
    y2
    ];
}
function a2c (x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
    // for more information of where this math came from visit:
    // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
    var PI = Math.PI,
        mathCos = Math.cos,
        mathSin = Math.sin,
        mathSqrt = Math.sqrt,
        abs = Math.abs;
    var _120 = PI * 120 / 180,
    rad = deg2rad * (+angle || 0),
    res = [],
    xy,
    rotate = function(x, y, rad) {
        var X = x * mathCos(rad) - y * mathSin(rad),
        Y = x * mathSin(rad) + y * mathCos(rad);
        return {
            x: X,
            y: Y
        };
    };
    if (!recursive) {
        xy = rotate(x1, y1, -rad);
        x1 = xy.x;
        y1 = xy.y;
        xy = rotate(x2, y2, -rad);
        x2 = xy.x;
        y2 = xy.y;
        var cos = mathCos(deg2rad * angle),
        sin = mathSin(deg2rad * angle),
        x = (x1 - x2) / 2,
        y = (y1 - y2) / 2;
        var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
        if (h > 1) {
            h = mathSqrt(h);
            rx = h * rx;
            ry = h * ry;
        }
        var rx2 = rx * rx,
        ry2 = ry * ry,
        k = (large_arc_flag == sweep_flag ? -1 : 1) *
        mathSqrt(abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
        cx = k * rx * y / ry + (x1 + x2) / 2,
        cy = k * -ry * x / rx + (y1 + y2) / 2,
        f1 = math.asin(((y1 - cy) / ry).toFixed(9)),
        f2 = math.asin(((y2 - cy) / ry).toFixed(9));

        f1 = x1 < cx ? PI - f1 : f1;
        f2 = x2 < cx ? PI - f2 : f2;
        f1 < 0 && (f1 = PI * 2 + f1);
        f2 < 0 && (f2 = PI * 2 + f2);
        if (sweep_flag && f1 > f2) {
            f1 = f1 - PI * 2;
        }
        if (!sweep_flag && f2 > f1) {
            f2 = f2 - PI * 2;
        }
    } else {
        f1 = recursive[0];
        f2 = recursive[1];
        cx = recursive[2];
        cy = recursive[3];
    }
    var df = f2 - f1;
    if (abs(df) > _120) {
        var f2old = f2,
        x2old = x2,
        y2old = y2;
        f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
        x2 = cx + rx * mathCos(f2);
        y2 = cy + ry * mathSin(f2);
        res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
    }
    df = f2 - f1;
    var c1 = mathCos(f1),
    s1 = mathSin(f1),
    c2 = mathCos(f2),
    s2 = mathSin(f2),
    t = math.tan(df / 4),
    hx = 4 / 3 * rx * t,
    hy = 4 / 3 * ry * t,
    m1 = [x1, y1],
    m2 = [x1 + hx * s1, y1 - hy * c1],
    m3 = [x2 + hx * s2, y2 - hy * c2],
    m4 = [x2, y2];
    m2[0] = 2 * m1[0] - m2[0];
    m2[1] = 2 * m1[1] - m2[1];
    if (recursive) {
        return [m2, m3, m4][concat](res);
    } else {
        res = [m2, m3, m4][concat](res).join()[split](",");
        var newres = [];
        for (var i = 0, ii = res.length; i < ii; i++) {
            newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
        }
        return newres;
    }
}