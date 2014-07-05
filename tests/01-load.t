var tap = require("tap"),
    test = tap.test,
    plan = tap.plan,
    config;


test("load config", function (t) {
   config = require("../lib/config")
   t.plan(13)
   t.ok(config, "object loaded")
   t.ok(config.ini, "has INI interface")
   t.type(config.ini, "object", "INI interface is the right type")
   t.ok(config.general, "has Generic Config interface")
   t.type(config.general, "object", "Generic Config interface is the right t ype")
   t.ok(config.yaml, "has YAML interface")
   t.type(config.yaml, "object", "YAML interface is the right type")
   t.ok(config.json, "has JSON interface")
   t.type(config.json, "object", "JSON interface is the right type")
   t.ok(config.xml, "has XML interface")
   t.type(config.xml, "object", "XML interface is the right type")
   t.ok(config.jsol, "has Javascript Object Literal interface")
   t.type(config.jsol, "object", "JSOL interface is the right type")
   t.end()
})

