var _clock;
var db;
function sqlError(tx,err)
{
    alert("Error processing SQL: "+err.message);
}

function init_db()
{
    db = window.openDatabase("profile", "1.0", "profile", 10000000);
    
    var createDB = function (tx) {
        //  tx.executeSql('DROP TABLE IF EXISTS profile');
        tx.executeSql('CREATE TABLE IF NOT EXISTS profile (name unique, value)');
    };
    
    db.transaction( createDB, sqlError, null);
}

function onDeviceReady()
{
    $('[data-role=page]').live('pageinit', function (event) { 
        var id = $(this).attr('data-id');
        if(id=='profile') init_profile();
       if(id=='map') init_map();
       if(id=='scanner') init_scanner();
       if(id=='qrcode') init_qrcode();
       if(id=='sponsor') init_sponsor();

   });
    
    $('[data-role=page]').live('pagehide', function (event) { 
                               var id = $(this).attr('data-id');
                                 if(id=='profile') deinit_profile();
//                               if(id=='map') deinit_map();
//                               if(id=='scanner') deinit_scanner();
//                               if(id=='qrcode') deinit_qrcode();
//                               if(id=='sponsor') deinit_sponsor();
                               
                               });

    
    init_db();
    startClock();
    _clock = window.setInterval(startClock, 1000);
    
}

function startClock()
{
    // get the date and how long are we from launch
    var TargetDate = new Date(2012,5,30,8,0);
    var Today = new Date();
    var diff = TargetDate.getTime() - Today.getTime();
    
    if (diff < 0)
    {
        $('#clock_counter').html('NOW').addClass('now');
        $('#clock_unit').html('');
        window.clearInterval(_clock);
        _clock = false;
        return;
    }
    
    

    dl = parseInt(diff / 86400000);
    $('#clock_day').html('<em>'+dl+'</em>days');
    
    diff %= 86400000;
    dl = parseInt(diff / 3600000);
    str = '<em>'+dl+'</em>h';
        
    diff %= 3600000;
    dl = parseInt(diff / 60000);
    str = str+' <em>'+dl+'</em>m';

    diff %= 60000;
    dl = parseInt(diff / 1000);
    str = str+' <em>'+dl+'</em>s';
    
    $('#clock_time').html(str);
    
}

// qrcode
function init_qrcode()
{
    // show or hide the signup/update button
    var  querySuccess = function(tx, results) {
        if (results.rows.length <= 0)
        {
            // fresh
            $('#qrcode-img').html('Please update your profile');     
        }
        else
        {
            // populate data into form
            var email = results.rows.item(0).value;
            if (email=='') $('#qrcode-img').html('Please update your email in profile');
            else $('#qrcode-img').html('').qrcode({width:280,height:280,text: "i<3barcamp://"+email});
        }
        
    };
    
    db.transaction(function(tx) {
                   tx.executeSql("SELECT * FROM profile WHERE name=?", ['email'], querySuccess, sqlError);
                   });
}

// profile
function deinit_profile()
{
    navigator.geolocation.clearWatch(watch);
}

function init_profile()
{	
	$('#register').click(doregister)
	$('#updateprofile').click(doupdate);
	$('#snap').click(snap);

    // show or hide the signup/update button
    var  querySuccess = function(tx, results) {
        if (results.rows.length <= 0)
        {
            // fresh
            $('#register').show();
        }
        else
        {
            // populate data into form
            for(var i=0;i<results.rows.length;i++)
            {
                var e = results.rows.item(i);
                $('#form *[name='+e.name+']').val(e.value);
                if (e.name=='photo')
                    $('#photo').attr('src', "data:image/jpeg;base64," + e.value);
            }
            $('#updateprofile').show();
        }
    };
    
    db.transaction(function(tx) {
                   tx.executeSql('SELECT * FROM profile', [], querySuccess, sqlError);
                   });
    
    
    
    // start watching your location
    var geolocationSuccess = function(position) {
        $('#form *[name=geolocation]').val(position.coords.latitude+','+position.coords.longitude);
    };
    watch = navigator.geolocation.watchPosition(geolocationSuccess);
}

function doupdate()
{
    savedata();
}
function doregister()
{
    savedata();	
}
function savedata()
{
    var replaceRow = function(tx) {
        $('#form *[name]').each(function(idx,e) { 
                                tx.executeSql('REPLACE INTO profile values (?,?)', [e.name, e.value]);
                                });
    };
    
    db.transaction(replaceRow, sqlError,function() { 
                   // upload to server
                   $.post('http://wsatp.com/barcamp.php?a=save', $('#form *[name]').serialize(), function(r) { 
                          if (r!='OK')
                          alert(r);
                          else
                          alert('Done!');
                          });
                   });
}

// take picture as profile
//
function onPhotoDataSuccess(imageData) {
    // Uncomment to view the base64 encoded image data
    // console.log(imageData);
    $('#form *[name=photo]').val(imageData);
    $('#photo').attr('src', "data:image/jpeg;base64,"+imageData);
}

function photoError(err) 
{
    alert('Snap photo error: '+err);
}

function snap() {
    // Take picture using device camera, allow edit, and retrieve image as base64-encoded string  
    navigator.camera.getPicture(onPhotoDataSuccess, photoError, { quality: 75, targetWidth: 300, targetHeight:300, allowEdit: true, destinationType: navigator.camera.DestinationType.DATA_URL });	 
    return false;
}

// map
function init_map()
{

}

// scanner
var contact = false;
function init_scanner()
{
	$('#scanner-scanqr').click(scanqr);
	$('#scanner-addcontact').click(addcontact);

    $('#scanner-addcontact').hide();
    scanqr();
}

function scanqr()
{
    window.plugins.barcodeScanner.scan(scannerSuccess, scannerFailure);
}

function scannerSuccess(result) {
    console.log(JSON.stringify(result));
    if (result.cancelled===true) return;
    if (result.format!='QR_CODE') { alert('Invalid code'); return; }
    $('#scanner-output').html("Checking server");
    $.getJSON('http://wsatp.com/barcamp.php', { a:'query', t:result.text }, function(r){
              console.log(JSON.stringify(r));
              if (!r || r==undefined || r.email==undefined) { $('#scanner-output').html('<p align=center><img src="troll.jpg"><br>Bad QR Code, try again.</p>'); return; }
              var html = '';
              contact = r;
              html += '<br>Name: ' + r.name;
              html += '<br>Email: ' + r.email;
              html += '<br>Phone: ' + r.phone;
              html += '<br>Company: ' + r.company;
              html += '<br>Title: ' + r.title;
              html += '<br>About: ' + r.about;
              html += '<br>Photo: <img src="data:image/jpeg;base64,'+r.photo+'">';
              html += '<br><img src="http://maps.google.com/maps/api/staticmap?center='+r.geolocation+'&amp;zoom=7&amp;size=300x300&amp;maptype=undefined&amp;markers='+r.geolocation+'&amp;sensor=false" alt="" />';
              
              $('#scanner-output').html(html);
              $('#scanner-addcontact').show();
              });
}

function scannerFailure(message) {
    alert('scan failed '+message)
}

function addcontact()
{
    if (!contact) 
    {
        alert('No contact');
        return;
    }
    // create a new contact
    var newContact = navigator.contacts.create();
    
    // name
    var name = new ContactName();
    name.givenName = contact.name;
    newContact.name = name;
    
    //phone
    var fields = [1];
    fields[0] = new ContactField('mobile', contact.phone);
    newContact.phoneNumbers = fields;
    
    //email
    fields = [1];
    fields[0] = new ContactField('work', contact.email);
    newContact.emails = fields;
	
    //photo
    fields = [1];
    fields[0] = new ContactField('url', 'data:image/jpeg;base64,'+contact.photo);
    newContact.photos = fields;
    
    //company
    organizations = [1];
    var org = new ContactOrganization();
    org.name = contact.company;
    org.title = contact.title;
    organizations[0] = org;
    newContact.organizations = organizations;
    
    // about
    newContact.note = contact.about;
    
    var onSaveError = function (contactError) {
        alert("Error = " + contactError.code);
    }
    
    newContact.save(
                    function() { 
                    alert('Saved to contact'); 
                    }, 
                    function (contactError) {
                    alert("Error = " + contactError.code);
                    }
                    );
    console.log('contact saved');
    
}

// sponsor
function init_sponsor()
{
    $('#sponsorlist').load('http://wsatp.com/barcamp.php?a=sponsors', function() { 
                           $('#sponsorlist').listview('refresh');
    });
}
