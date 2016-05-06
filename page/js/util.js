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
        '" type="button" class="btn btn-default pag-btn">' + 
        text +'</button>');
}

var pageCap = 10;

var loadPagBar = function(cur, total) {
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
    if(cur != 1)
        result.push($getPagBtn(cur - 1, '上一页'));
    
    if(pages.indexOf(1) == -1) {
        result.push($getPagBtn(1, 1));
        result.push($getPagBtn('', '...'));
    }
    
    for(var i in pages) {
        result.push($getPagBtn(pages[i], pages[i]));
    }
    
    if(pages.indexOf(total) == -1) {
        result.push($getPagBtn('', '...'));
        result.push($getPagBtn(total, total));
    }
    
    if(cur != total && total != 1)
        result.push($getPagBtn(cur + 1, '下一页'));
    
    for(var i = 0; i < result.length; i++)
        $('#pag-bar').append(result[i]);
    $('.pag-btn').click(refreshPage);
};

var refreshPage = function() {
    var pg = $(this).data('pg');
    if(pg == '') return;
    curPage = pg;
    loadPagBar(curPage, totalPage);
    loadResult(data.slice((curPage - 1) * pageCap, curPage * pageCap));
};