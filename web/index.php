<?php

require_once __DIR__.'/../vendor/autoload.php';
use Parse\ParseClient;
use Parse\ParseObject;
use Parse\ParseException;
use Parse\ParseQuery;

$config = require_once(__DIR__.'/../config/config.php');
ParseClient::initialize($config['parse']['app_id'], 
                        $config['parse']['rest_key'], 
                        $config['parse']['master_key']);

$app = new Silex\Application();
$app['debug'] = true;

$app->register(new Silex\Provider\TwigServiceProvider(), array(
    'twig.path' => __DIR__.'/templates',
));

$app->get('/', function(Silex\Application $app){
    return $app['twig']->render(
        'index.html.twig',
        array(
            'who' => 'world'
        )
    );
});

$app->run();