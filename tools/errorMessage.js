var m =
    new Map([
        [200, '操作成功!'],

        [500, '内部错误'],
        [404, '找不到访问的资源'],
        [301, '接口校验码错误!'],
        [302, '数据库访问失败!'],



        [3001, '客户已经绑定过管理员了!'],
        [3002, '客户未绑定管理员，无法进行充值!'],
        [3003, '无法找到该代理员'],
        [3004, '缺少客户token参数!'],
        [3005, '缺少客户token或充值金额!'],
        [3006, '无法找到客户信息!'],
        [3007, '绑定时，缺少客户token或代理人id!'],
        [3008, '绑定信息保存失败!']
    ]);

exports.get_code_message = function (code) {
    return m.get(code)

}