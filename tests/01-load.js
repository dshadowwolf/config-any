var tap = require("tap"),
    test = tap.test,
    plan = tap.plan,
    config;


test("load config", function (t) {
   t.plan(18)
   t.doesNotThrow( function() { config = require("../lib/config"); } )
   t.ok(config, "object loaded")
   t.ok(config.ini, "has INI interface")
   t.type(config.ini, "function", "INI interface is the right type")
   t.ok(config.general, "has Generic Config interface")
   t.type(config.general, "function", "Generic Config interface is the right t ype")
   t.ok(config.yaml, "has YAML interface")
   t.type(config.yaml, "function", "YAML interface is the right type")
   t.ok(config.json, "has JSON interface")
   t.type(config.json, "function", "JSON interface is the right type")
   t.ok(config.xml, "has XML interface")
   t.type(config.xml, "function", "XML interface is the right type")
   t.ok(config.load_files, "has load_files()")
   t.ok(config.load_stems, "has load_stems()")
   t.ok(config.extensions, "has extensions()")
   t.type(config.load_files, "function")
   t.type(config.load_stems, "function")
   t.type(config.extensions, "function")
   t.end()
})

