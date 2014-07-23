config-any
==========

A mostly API and result compatible re-implementation of Perl's venerable Config::Any


Basically...

    var config = require('config-any');
    
    var results = config.load_files( { files: [ <files> ] } );
    
At the moment it knows every format that the base Perl module is
potentially capable of handling before any plugins that are not part
of the base distribution are added.

See the documentation of Config::Any on CPAN (or via 'perldoc
Config::Any') for more information.
