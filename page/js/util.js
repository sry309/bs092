function getUrl() {
    return 'http://202.120.40.73:28080';
}

function getUser() {
    var id = localStorage.getItem('id');
    var un = localStorage.getItem('un');
    var pw = localStorage.getItem('pw');
    
    if(id && un && pw)
        return {
            id: id,
            un: un,
            pw: pw
        }
    else return null;
}

function setUser(id, un, pw) {
    localStorage.setItem('id', id);
    localStorage.setItem('un', un);
    localStorage.setItem('pw', pw);
}

function htmlSpecialChars(s) {
    return s.replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

var statusMap = {
    1: 'View Resouce',
    2: 'Manage Resource',
    3: 'Delete Object',
    4: 'Previlege Assignment'
};

var algos = {
    assoc: ['apriori'],
    classify: ['knn', 'svm', 'naive_bayes'],
    cluster: ['kmeans', 'kmedoids']
};

var algoDict = {
    assoc: "关联",
    classify: "分类",
    cluster: "聚类",
    apriori: "Apriori",
    knn: "KNN",
    svm: "SVM",
    naive_bayes: "Naive Bayes",
    kmeans: "Kmeans",
    kmedoids: "Kmedoids"
};

var $getPagBtn = function(data, text) {
    return $('<button data-pg="' + data + 
        '" type="button" class="btn btn-primary pag-btn">' + 
        text +'</button>');
};

var pageCap = 10;

var loadPagBar = function(cur, total, data) {
    if(cur > total) throw new Error();
    
    $('#pag-bar').empty();
    var pages;
    if(cur == 1 || cur == 2)
        pages = [1, 2, 3, 4, 5];
    else if(cur == total || cur == total - 1)
        pages = [total - 4, total - 3, total - 2, total - 1, total];
    else
        pages = [cur - 2, cur - 1, cur, cur + 1, cur + 2];
    pages = pages.filter(function(x){return x > 0 && x <= total;});
    
    var result = [];
    if(cur != 1) {
        var $prev = $getPagBtn(cur - 1, '上一页');
        $prev.addClass('pag-prev');
        result.push($prev);
    }
    
    
    var $nums = $('<div class="btn-group pag-num" role="group"></div>');
    result.push($nums);
    if(pages.indexOf(1) == -1) {
        $getPagBtn(1, 1).appendTo($nums);
        $getPagBtn('', '...').appendTo($nums);
    }
    
    for(var i in pages) {
        $getPagBtn(pages[i], pages[i]).appendTo($nums);
    }
    
    if(pages.indexOf(total) == -1) {
        $getPagBtn('', '...').appendTo($nums);
        $getPagBtn(total, total).appendTo($nums);
    }
    
    if(cur != total && total != 1) {
        var $next = $getPagBtn(cur + 1, '下一页');
        $next.addClass('pag-next');
        result.push($next);
    }
    
    for(var i = 0; i < result.length; i++)
        $('#pag-bar').append(result[i]);
    $('.pag-btn').click(function(){refreshPage.call(this, total, data)});
};

var refreshPage = function(total, data) {
    var pg = $(this).data('pg');
    if(pg == '') return;
    loadPagBar(pg, total, data);
    loadResult(data.slice((pg - 1) * pageCap, pg * pageCap));
};

var keys = function(o) {
    var keys = [];
    for(var k in o)
        keys.push(k);
    return keys;
};

var values = function(o) {
    var values = [];
    for(var k in o)
        values.push(o[k]);
    return values;
};

var labelToColor = function(i) {
    var m = [
        "#993", "#C9C", "#C96", "#666", "#C99", "#CC9", "#333", "#96C"
    ];
    
    return m[i % m.length];
};

// 阻塞延迟
function sleep(milliSeconds) { 
    var startTime = new Date().getTime(); 
    while (new Date().getTime() < startTime + milliSeconds);
}

// 两点连线与x轴的夹角，如果两点相同返回0
function slopeAngle(p1, p2) {
    var angle = Math.atan2(p1.y - p2.y, p1.x - p2.x);
    if(angle < 0) angle += Math.PI / 2;
    return angle;
}

// 返回最下面的点，如果y值相同则返回左边的点
function findMostLeftBottom(arr) {
    if(arr.length == 0) throw new Error();
    var res = arr[0];
    for(var i = 1; i < arr.length; i++) {
        var p = arr[i];
        if(p.y < res.y || (p.y == res.y && p.x < res.x))
            res = p;
    }
    return res;
}

// Graham扫描算法
function graham(arr) {
    
    var lbMost = findMostLeftBottom(arr);
    var pos = arr.indexOf(lbMost);
    arr.splice(pos, 1);
    
    arr.sort(function(p1, p2) {
        return slopeAngle(p1, lbMost) - slopeAngle(p2, lbMost);
    })
    
    var res = [lbMost];
    for(var i = 0; i < arr.length; i++) {
        var p = arr[i];
        if(res.length < 3) 
            res.push(p);
        else {
            var p1 = res[res.length - 2],
                p2 = res[res.length - 1];
            var theta1 = slopeAngle(p1, p2),
                theta2 = slopeAngle(p2, p);
            if(theta1 < theta2) // 左转保留
                res.push(p);
            else // 右转舍弃
            {
                res.pop();
                i--;
            }
        }
    }
    arr.splice(pos, 0, lbMost);
    return res;
}