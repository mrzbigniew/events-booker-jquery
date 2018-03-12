<?php
header('Content-Type: text/json; charset=UTF-8');
$data = file_get_contents('php://input');
$objData = json_decode($data);

foreach($objData as $obj) {
    var_dump($obj);
}