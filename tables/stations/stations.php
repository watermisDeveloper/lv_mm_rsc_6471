<?php
/**
 * Table DelegateClass
 * Xataface Delegate Class declaration for Xataface 2.0alpha application
 * WaterMIS. Includes map, plotting and import section to each station record.
 * 
 * @version 1.0
 * @author Mirko Maelicke <mirko@maelicke-online.de>
 */
class tables_stations {
    /**
     * Returns permissions array.  This method is called every time an action on 
     * sensor table is performed to make sure that the user has permission to 
     * perform the action.
     * @param record A Dataface_Record object (may be null) against which we check
     *               permissions.
     * @see Dataface_PermissionsTool
     * @see Dataface_AuthenticationTool
     * @version 1.0
     * @author Mirko Maelicke <mirko@maelicke-online.de>
     */
     function getPermissions(&$record){
         $auth =& Dataface_AuthenticationTool::getInstance();
         $user =& $auth->getLoggedInUser();
         if ( !isset($user) ) return Dataface_PermissionsTool::READ_ONLY();
             // if the user is null then nobody is logged in... read only
         $role = $user->val('Role');
         return Dataface_PermissionsTool::getRolePermissions($role);
             // Returns all of the permissions for the user's current role.
    }
    
    /**
     * Create a new section for each station Record to include a OpenLayers
     * map object, showing the station.
     * 
     * @return array Dataface section content array
     * @version 1.0
     * @author Mirko Maelicke <mirko@maelicke-online.de>
     */
    function section__map(){
        return array(
            'content'=>"<div style='width:300px; height:300px' style='
                margin-left:auto; margin-right:auto;' id='map'></div>",
            'class'=>'main',
            'label'=>'Map',
            'order'=>'1'
        );
    }
    
    /**
     * Create a new section for each station record to include a plot-link drop
     * down list populated with all related sensors valued with a link to plot
     * action
     * 
     * @see actions_plot
     * @version 1.0
     * @author Mirko Maelicke <mirko@maelicke-online.de>
     */
    function section__plot(){
        $app =& Dataface_Application::getInstance();
        $record =& $app->getRecord();
        $sensors = df_get_records_array('sensors', array('id_station'=>$record->val('id_station'),
            'type_station'=>$record->val('type_station')));
        
        /*create the content array*/
        $content = "<select onchange='window.location.href=this.options[this.selectedIndex].value'>";
        $content .= "<option>Select Sensor...</option>";
        
        foreach ($sensors as $sensor){
            $content .= "<option value='index.php?-table=sensors&type_station=".$sensor->val('type_station')
                    ."&id_station=".$sensor->val('id_station')."&sensor=".$sensor->val('sensor')
                    ."&type_timeseries=".$sensor->val('type_timeseries')."&-action=plot'>".
                    $sensor->val('description')."</option>";
        }
        $content .= "</select>"; 
        
        return array(
            'content' => $content,
            'class' => 'main',
            'label' => 'Plot Timeseries',
            'order' => 0
        );
    }
    
    /**
     * Create a new section for each station record to include several links to
     * related record pages. should link to all sensors by dropdown and to 
     * discharge related tables for discharge sensors
     * 
     * @see actions_applyImport
     * @version 1.0
     * @author Mirko Maelicke <mirko@maelicke-online.de>
     */
    function section__links(){
        $app =& Dataface_Application::getInstance();
        $station =& $app->getRecord();
// HIER BIN ICH GERADE: SENSOR DROPDOWN EINFÜGEN        
       $sensors = df_get_records_array('sensors', array('id_station'=>$station->val('id_station'),
            'type_station'=>$station->val('type_station')));
        
        if (isset($sensors)){
            $content = "The related sensors, hold by this station can be selected
                by the dropdown list below or you can view <a href='index.php?-table=sensors&type_station=".
                    $station->val('type_station')."&id_station=".$station->val('id_station')."'>all</a> sensors.";
            $content .= "<table><tr><th>Sensors</th></tr>";
            $content .= "<tr><td><select onchange='window.location.href=this.options[this.selectedIndex].value'>".
                    "<option>Select a related Sensor...</option>";
            foreach ($sensors as $sensor){
                $content .= "<option value='index.php?-table=sensors&type_station=".$sensor->val('type_station')
                        ."&id_station=".$sensor->val('id_station')."&sensor=".$sensor->val('sensor')
                        ."&type_timeseries=".$sensor->val('type_timeseries')."'>".
                        $sensor->val('description')."</option>";
            }
            $content .= "</select></td></tr></table>";
        }
        else {
            $content = "This station doesn't hold any sensors, maybe you want to
                delete it?";
        }
        
        return array(
            'content' => $content,
            'class'   => 'main',
            'label'   => 'related Links',
            'order'   => 1
        );

    }
    
    /**
     * includes necessary javascript files for map section
     * 
     * @version 1.0
     * @author Mirko Maelicke <mirko@maelicke-online.de>
     */
    function block__custom_javascripts(){
        $app =& Dataface_Application::getInstance();
        $record =& $app->getRecord();
        
        echo "\t\t<!-- jQuery library (served from Google) -->\n";
        echo "\t\t<script src='//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js'></script>\n";
        echo "\t\t<!-- load OpenLayers -->\n";
        echo "\t\t<script src='http://openlayers.org/api/OpenLayers.js'></script>\n";
        echo "<script type='text/javascript' src='js/stations.js'></script>\n";
        
        /*parse Station information to Javascript using JSON*/
        if(isset($record)){   
            echo "<script type='text/javascript'>";
            echo "var Station ={'name':'".$record->val('name_station')."','lon':'".
                    $record->val('longitude')."','lat':'".$record->val('latitude')."'};";
            echo "</script>";
        }
    }
}

?>
