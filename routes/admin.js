
var Admin = require('../controller/admin/admin');


module.exports = function(app) {

  //跳转到登录页面
  app.get('/login',Admin.login);
  //跳转到登录页面
  app.get('/register',Admin.register);
  // 后台首页
  app.get('/admin', Admin.admin);

  //添加管理员
  app.post('/admin/post_user', Admin.add_admin);
  //分页获取管理员
  app.post('/admin/get_users', Admin.get_users);
  //删除管理员信息
  app.post('/admin/user_del', Admin.user_del);
  app.post('/admin/user_edit', Admin.user_edit);
  app.post('/admin/change_password', Admin.change_password);

  //提交登录信息，实现登录信息校验
  app.post('/login',Admin.checkUser);
  //提交注册信息，实现注册校验
  app.post('/register',Admin.post_register);
  //用户登出操作
  app.get('/logout',Admin.logout);
  //给新注册的用户授权
  app.post('/authorize',Admin.authorize);
  app.post('/admin/user_get', Admin.user_get);

};