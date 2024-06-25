<?php
require("mp_functions.php");

$db=loadGameDB();
if (isset($_GET["id"])) {
    if (getGame($db,$_GET["id"])) {
    include("chess-computer.html");
    include("enterUsername.html");
    }
    else include ("play-chess.html");
}

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

else if (isset($_POST["username"]) && isset($_POST["playercolor"])) {
    include ("chess-online.html");
    ?>
        <script type="module">
            import * as Chess from "./chess.js";
            await Chess.setupOnlineMatch("<?php echo $_POST["username"]?>","<?php echo $_POST["playercolor"]?>");
        </script>
    <?php
}
else if (isset($_POST["play-computer"])) include("chess-computer.html");



else include ("play-chess.html");
