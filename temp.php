<?php
require("mp_functions.php");
$path="sqlite:".__DIR__.DIRECTORY_SEPARATOR."info.db";
$db= new PDO($path);

createNewGame($db,"brohemian",false,"jesus");

$res=$db->query("SELECT * FROM Games");
print_r($res->fetchAll(PDO::FETCH_ASSOC));