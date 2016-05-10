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
}

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
}

var labelToColor = function(i) {
    var m = [
        "#993", "#C9C", "#C96", "#666", "#C99", "#CC9", "#333", "#96C"
    ];
    
    return m[i % m.length];
}