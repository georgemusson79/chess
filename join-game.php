<?php
include("chess.html");
require("mp_functions.php");

$db=loadGameDB();
if (isset($_GET["id"])) {
    if (checkIfGameExists($db,$_GET["id"])) {
        include("enterUsername.html");
    }
}
