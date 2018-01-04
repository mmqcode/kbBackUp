var agentC = require("../controller/admin/agentController");


module.exports = function (app) {

    app.post("/agent/agent_add", agentC.agent_add);
    app.post("/agent/agents_get", agentC.get_agents);
    app.post("/agent/get_super_agents", agentC.get_super_agents);
    app.post("/agent/agent_rate_add_or_edit", agentC.agent_rate_add_or_edit);
    app.post("/agent/load_agent_rate", agentC.load_agent_rate);
    app.post("/agent/get_agent_share_detail", agentC.get_agent_share_detail);
    app.post("/agent/load_agent_rateinuse", agentC.load_agent_rateinuse);

    
}