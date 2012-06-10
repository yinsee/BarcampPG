package com.wsatp.barcamppg;

//import android.app.Activity;
import org.apache.cordova.*;

import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.os.Bundle;


public class BarcampPGActivity extends DroidGap {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
    	super.onCreate(savedInstanceState);
//        setContentView(R.layout.main);
    	setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);

    	super.setIntegerProperty("splashscreen", R.drawable.splash);
        super.loadUrl("file:///android_asset/www/index.html", 3000);
    }
    
    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        //here you can handle orientation change
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);

    }
}