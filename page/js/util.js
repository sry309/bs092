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
}