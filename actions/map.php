<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of map
 *
 * @author mirko_000
 */
class actions_map {
    function handle($params){
        $app = Dataface_Application::getInstance();
        $stations = df_get_records_array('stations', array());
        
/*        echo "<script type='text/javascript'>";
        echo "var Stations = {";
        foreach ($stations as $station){
            echo "['name': '".$station->val('name_station')."','lon':".
                $station->val('longitude').",'lat':".$station->val('latitude')
                    ."],";
        }
        echo "};";
        echo "</script>";
*/        
        df_display(array('stations'=>$stations),'map.html');
    }
}

?>
