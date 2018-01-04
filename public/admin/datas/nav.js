var navs = [{
	"title": "系统管理",
	"icon": "fa-cubes",
	"spread": true,
	"children": [{
		"title": "账户管理",
		"icon": "fa-table",
		"href": "admin_list.html"
	},{
		"title":"角色管理",
		"icon":"fa-cube",
		"href":"page/role/role_list.html",
	},{
        "title":"系统配置",
        "icon":"fa-asterisk",
        "href":"page/config/systemConfigInfo.html",
    }]
}, {
	"title": "用户管理",
	"icon": "fa-male",
	"spread": false,
	"children": [{
		"title": "用户列表",
		"icon": "fa-table",
		"href": "page/customer/customer_list.html"
	},{
        "title": "用户充值记录",
        "icon": "fa-money",
        "href": "page/customer/chargingRecord_list.html"
    }]
}, {
    "title":"代理人管理",
	"icon":"fa-user-circle",
	"spread":false,
	"children":[{
    	"title":"代理人列表",
		"icon":"fa-user-circle",
		"href":"page/agent/agent_list.html"
	},{
        "title":"分成比例设置",
        "icon":"fa-jpy",
        "href":"page/agent/agent_rate.html"
	}, {
		"title":"佣金明细",
		"icon":"fa-jpy",
		"href":"page/agent/agent_share.html"
	}]

},{
	"title":"日志管理",
    "icon": "fa-file",
    "spread": false,
    "children": [{
        "title": "接口日志",
        "icon": "fa-table",
        "href": "page/log/apiLog_list.html"
    }]
}
];