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
}