<?php
include("chess-computer.html");
require("mp_functions.php");

$db=loadGameDB();
if (isset($_GET["id"])) {
    if (getGame($db,$_GET["id"])) {
        include("enterUsername.html");
    }


}