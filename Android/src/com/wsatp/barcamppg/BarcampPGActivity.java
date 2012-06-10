package com.wsatp.barcamppg;

//import android.app.Activity;
import org.apache.cordova.*;

import android.os.Bundle;


public class BarcampPGActivity extends DroidGap {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
    	super.onCreate(savedInstanceState);
//        setContentView(R.layout.main);
    	super.setIntegerProperty("splashscreen", R.drawable.splash);
        super.loadUrl("file:///android_asset/www/index.html", 3000);
    }
}