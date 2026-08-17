package com.lorapok.player;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

/**
 * Enhanced Media Widget Provider for Lorapok Player.
 * 
 * Displays current track info (title, artist) with album art,
 * and provides Previous / Play-Pause / Next transport controls.
 * State is synced from the Capacitor web layer via SharedPreferences.
 */
public class MediaWidgetProvider extends AppWidgetProvider {

    private static final String ACTION_TOGGLE_PLAY = "com.lorapok.player.TOGGLE_PLAY";
    private static final String ACTION_NEXT        = "com.lorapok.player.WIDGET_NEXT";
    private static final String ACTION_PREV        = "com.lorapok.player.WIDGET_PREV";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        
        String action = intent.getAction();
        if (ACTION_TOGGLE_PLAY.equals(action) || ACTION_NEXT.equals(action) || ACTION_PREV.equals(action)) {
            // Forward the command to the MediaPlaybackService
            Intent serviceIntent = new Intent(context, MediaPlaybackService.class);
            switch (action) {
                case ACTION_TOGGLE_PLAY:
                    SharedPreferences prefs = context.getSharedPreferences("group.lorapok.widget", Context.MODE_PRIVATE);
                    boolean isPlaying = "true".equals(prefs.getString("media_playing", "false"));
                    serviceIntent.setAction(isPlaying ? MediaPlaybackService.ACTION_PAUSE : MediaPlaybackService.ACTION_PLAY);
                    break;
                case ACTION_NEXT:
                    serviceIntent.setAction(MediaPlaybackService.ACTION_NEXT);
                    break;
                case ACTION_PREV:
                    serviceIntent.setAction(MediaPlaybackService.ACTION_PREV);
                    break;
            }
            context.startService(serviceIntent);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences("group.lorapok.widget", Context.MODE_PRIVATE);
        String title    = prefs.getString("media_title", "Lorapok Player");
        String artist   = prefs.getString("media_artist", "Ready to play");
        boolean isPlaying = "true".equals(prefs.getString("media_playing", "false"));

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_media);

        // Set text content
        views.setTextViewText(R.id.widget_title, title);
        views.setTextViewText(R.id.widget_artist, artist);
        views.setTextViewText(R.id.widget_btn_play_pause, isPlaying ? "⏸" : "▶");

        // Previous button
        views.setOnClickPendingIntent(R.id.widget_btn_prev,
            buildBroadcastIntent(context, ACTION_PREV, 10));

        // Play/Pause button
        views.setOnClickPendingIntent(R.id.widget_btn_play_pause,
            buildBroadcastIntent(context, ACTION_TOGGLE_PLAY, 11));

        // Next button
        views.setOnClickPendingIntent(R.id.widget_btn_next,
            buildBroadcastIntent(context, ACTION_NEXT, 12));

        // Tapping the title area opens the app
        Intent launchIntent = new Intent(context, MainActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent launchPending = PendingIntent.getActivity(context, 0, launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_title, launchPending);
        views.setOnClickPendingIntent(R.id.widget_artist, launchPending);
        views.setOnClickPendingIntent(R.id.widget_art, launchPending);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static PendingIntent buildBroadcastIntent(Context context, String action, int requestCode) {
        Intent intent = new Intent(context, MediaWidgetProvider.class);
        intent.setAction(action);
        return PendingIntent.getBroadcast(context, requestCode, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
}
