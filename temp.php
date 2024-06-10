<?php
require("mp_functions.php");
$path="sqlite:".__DIR__.DIRECTORY_SEPARATOR."info.db";
$db= new PDO($path);
deleteAllGames($db);
$id=createNewGame($db,"rnbqkbnr/ppp1pppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",true,"jesus");

//echo addSecondPlayer($db,"jesus2",$id);

 $res=$db->query("SELECT * FROM Games");
 print_r($res->fetchAll(PDO::FETCH_ASSOC));