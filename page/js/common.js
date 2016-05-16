$(function()
{

    if(getUser())
    {
      $('.navbar-nav').append('<li><a href="./project.html">项目</a></li>');
      $('.navbar-nav').append('<li><a href="./history.html">历史</a></li>');
      $('.navbar-nav').append('<li><a href="./message.html">消息</a></li>');
      $('.navbar-nav').append('<li><a href="./logout.html">退出</a></li>');
    }
    else
    {
      $('.navbar-nav').append('<li><a href="./login.html">登录</a></li>');
      //$('.navbar-nav').append('<li><a href="./reg.html">注册</a></li>');
    }
    
});