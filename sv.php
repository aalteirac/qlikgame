<?php
    $id = $_GET['sc'];
    $fd = fopen("scr.txt","w");
    fwrite($fd, $id);
    fclose($fd);
?>