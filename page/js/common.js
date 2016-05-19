$(function()
{
    var user = getUser();
    
    if(user)
    {
      $('.navbar-nav').append('<li><a href="./project.html">项目</a></li>');
      $('.navbar-nav').append('<li><a href="./history.html">历史</a></li>');
      $('.navbar-nav').append('<li id="nav-msg"><a href="./message.html">消息</a></li>');
      $('.navbar-nav').append('<li><a href="./logout.html">退出</a></li>');
    }
    else
    {
      $('.navbar-nav').append('<li><a href="./login.html">登录</a></li>');
      $('.navbar-nav').append('<li><a href="./reg.html">注册</a></li>');
    }
    
    
    var getNotify = function() {
        $.ajax({
            type: "GET",
            url: "notify/" + user.id + '/',
            dataType: "json"
        }).done(function(json) {
            if (!json.succ) 
                alert(json.errmsg);
            else {
                if(json.unread != 0) {
                    $('#nav-msg .badge').remove();
                    var $badge = $('<span class="badge">' + json.unread + '</span>');
                    $('#nav-msg a').append($badge);
                }
            }
        }).fail(function(data) {
            console.log('Get notify failed!');
        });
    }
    
    if(user) {
        getNotify();
        setInterval(getNotify, 1 * 60 * 1000);
    }
});