/* Save this file with a jsx extension and place in your
Illustrator/Presets/en_US/Scripts folder. You can then 
access it from the File > Scripts menu */

/*
Script grabbed from
https://gist.github.com/bryanbuchanan/11387501
fixes negative areas "bug" (some areas are shown negative)
and shows result in square milimeters, given that's
the default unit used in document.
*/

if (app.documents.length > 0) {

    if (app.activeDocument.selection.length < 1) {
        alert('Select a path first');
    } else if (app.activeDocument.selection[0].area) {
        // Individual Items
        var objects = app.activeDocument.selection;
    } else if (app.activeDocument.selection[0].pathItems) {
        // Group/Compound Shape
        var objects = app.activeDocument.selection[0].pathItems;
    } else {
        alert('Please select a path or group.');
    }

    // Collect info
    // TODO, if no selection returned, objects.length is undefined
    // and shows an error, not important, and still works fine, though
    if (objects.length > 0) {
        var totalArea = 0;
        for (var i = 0; i < objects.length; i++) {
            if (objects[i].area) {
                // If negative, make it positive
                var totalArea = totalArea + Math.abs(objects[i].area);
            }
        }
        
        // 12.4451 is a multiplier that converts area returned to square milimeters.
        // I guess Illustrator returns inches or feet, no idea really.
        // Anyway, this value has been cherry picked from my own calculations.
        
        totalArea = 12.4451 * totalArea / 10000;
        
        // this part helps presenting a prettier alert
        var area = "area";
        if (i != 1) {
            area = "areas";
        }

        // Conversions    
        /*var ppi = 72;
        var areaInInches = Math.round((totalArea / ppi / ppi) * 100) / 100;
        if (areaInInches < 0) var areaInInches = -areaInInches;*/

        // Display, I assume that 1 square milimeter = 1 square meter.
        alert('Shape Area\n' + totalArea.toFixed(2) + ' square meters \n' + i + " " + area);
    }
}