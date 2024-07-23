<?php
require("mp_functions.php");

$db=loadGameDB();
$stop=false;

//if user isnt attempting to join a game with a different id run this code
if (isset($_COOKIE["username"]) && isset($_COOKIE["id"]) && (!isset($_GET["id"]) || $_GET["id"]==$_COOKIE["id"])) {
    $plrColor=checkCanRejoinGame($db,$_COOKIE["id"],$_COOKIE["username"]);
    if ($plrColor) {
        $playerIsBlack=($plrColor=="B_PLR") ? true : false;
        include("chess-computer.html");

        $id=$_COOKIE["id"];
        $username=$_COOKIE["username"];

        ?>
        <script type="module">
            import * as Chess from "./chess.js";
            await Chess.rejoinMatch("<?php echo $id; ?>", "<?php echo $username; ?>");
        </script>
       
        <?php
        exit();
    }

    else {
        //remove cookies if they are invalid
        
        setcookie("id","",time());
        setcookie("username","",time());
    }
}



if (isset($_GET["id"])) {

    //clear cookies and attempt to auto resign
    if (isset($_COOKIE["id"])) resign($db,$_COOKIE["id"]);
    setcookie("id","",time());
    setcookie("username","",time());

    if (getGame($db,$_GET["id"])) {
    include("chess-computer.html");
    include("enterUsername.html");
    }
    else include ("play-chess.html");
}

//join game
else if (isset($_POST["id"]) && isset($_POST["username"])) {
    $valid=true;
    if (getGame($db,$_POST["id"])) {
        include("chess-computer.html");
        ?>
        <script type="module">
            import {mp_autoSendUsername} from "./mp_requests.js";
            mp_autoSendUsername("<?php echo $_POST['id']; ?>", "<?php echo $_POST['username']; ?>");
        </script>
    <?php
    }

}    
//create game
else if (isset($_POST["username"]) && isset($_POST["playercolor"])) {
    include ("chess-online.html");
    ?>
        <script type="module">
            import * as Chess from "./chess.js";
            await Chess.setupOnlineMatch("<?php echo $_POST["username"]?>",<?php echo $_POST["playercolor"]?>);
        </script>
    <?php
}


//offline game
else if (isset($_POST["play-computer"])) include("chess-computer.html");



else include ("play-chess.html");
