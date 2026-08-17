package com.lorapok.player;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.os.IBinder;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;
import androidx.core.app.NotificationCompat;
import androidx.media.app.NotificationCompat.MediaStyle;

/**
 * MediaPlaybackService
 * 
 * A foreground service that keeps audio playback alive when the app is
 * in the background or the screen is locked. It drives:
 *   - A persistent media notification with transport controls
 *   - Lock-screen controls via MediaSession
 *   - Audio focus management
 *
 * The Capacitor web layer communicates with this service through
 * SharedPreferences (written by the MediaSession / WidgetBridge plugins)
 * and the service updates the notification & widget accordingly.
 */
public class MediaPlaybackService extends Service {

    private static final String CHANNEL_ID = "lorapok_playback";
    private static final int NOTIFICATION_ID = 1337;

    public static final String ACTION_PLAY   = "com.lorapok.player.PLAY";
    public static final String ACTION_PAUSE  = "com.lorapok.player.PAUSE";
    public static final String ACTION_NEXT   = "com.lorapok.player.NEXT";
    public static final String ACTION_PREV   = "com.lorapok.player.PREV";
    public static final String ACTION_STOP   = "com.lorapok.player.STOP";
    public static final String ACTION_UPDATE = "com.lorapok.player.UPDATE_METADATA";

    private MediaSessionCompat mediaSession;
    private boolean isPlaying = false;
    private String currentTitle = "Lorapok Player";
    private String currentArtist = "Ready to play";

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        initMediaSession();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getAction() != null) {
            switch (intent.getAction()) {
                case ACTION_PLAY:
                    isPlaying = true;
                    updatePlaybackState();
                    break;
                case ACTION_PAUSE:
                    isPlaying = false;
                    updatePlaybackState();
                    break;
                case ACTION_NEXT:
                    // Handled by the web layer via MediaSession callback
                    break;
                case ACTION_PREV:
                    // Handled by the web layer via MediaSession callback
                    break;
                case ACTION_STOP:
                    stopForeground(true);
                    stopSelf();
                    return START_NOT_STICKY;
                case ACTION_UPDATE:
                    readMetadataFromPrefs();
                    break;
            }
        } else {
            // Initial start — read current state from SharedPreferences
            readMetadataFromPrefs();
        }

        startForeground(NOTIFICATION_ID, buildNotification());
        return START_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        if (mediaSession != null) {
            mediaSession.setActive(false);
            mediaSession.release();
        }
        super.onDestroy();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Lorapok Playback",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Media playback controls for Lorapok Player");
            channel.setShowBadge(false);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);

            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) {
                nm.createNotificationChannel(channel);
            }
        }
    }

    private void initMediaSession() {
        mediaSession = new MediaSessionCompat(this, "LorapokMediaSession");
        mediaSession.setActive(true);

        mediaSession.setCallback(new MediaSessionCompat.Callback() {
            @Override
            public void onPlay() {
                isPlaying = true;
                updatePlaybackState();
                updateNotification();
                broadcastStateToWeb("play");
            }

            @Override
            public void onPause() {
                isPlaying = false;
                updatePlaybackState();
                updateNotification();
                broadcastStateToWeb("pause");
            }

            @Override
            public void onSkipToNext() {
                broadcastStateToWeb("next");
            }

            @Override
            public void onSkipToPrevious() {
                broadcastStateToWeb("prev");
            }

            @Override
            public void onStop() {
                isPlaying = false;
                updatePlaybackState();
                stopForeground(true);
                stopSelf();
            }

            @Override
            public void onSeekTo(long pos) {
                // Forward seek to the web layer
                SharedPreferences prefs = getSharedPreferences("group.lorapok.widget", MODE_PRIVATE);
                prefs.edit().putLong("seek_to", pos).apply();
                broadcastStateToWeb("seek");
            }
        });

        updatePlaybackState();
    }

    private void updatePlaybackState() {
        long actions = PlaybackStateCompat.ACTION_PLAY_PAUSE
            | PlaybackStateCompat.ACTION_SKIP_TO_NEXT
            | PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS
            | PlaybackStateCompat.ACTION_SEEK_TO
            | PlaybackStateCompat.ACTION_STOP;

        if (isPlaying) {
            actions |= PlaybackStateCompat.ACTION_PAUSE;
        } else {
            actions |= PlaybackStateCompat.ACTION_PLAY;
        }

        PlaybackStateCompat state = new PlaybackStateCompat.Builder()
            .setActions(actions)
            .setState(
                isPlaying ? PlaybackStateCompat.STATE_PLAYING : PlaybackStateCompat.STATE_PAUSED,
                PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN,
                1.0f
            )
            .build();

        mediaSession.setPlaybackState(state);
    }

    private void readMetadataFromPrefs() {
        SharedPreferences prefs = getSharedPreferences("group.lorapok.widget", MODE_PRIVATE);
        currentTitle = prefs.getString("media_title", "Lorapok Player");
        currentArtist = prefs.getString("media_artist", "Ready to play");
        isPlaying = "true".equals(prefs.getString("media_playing", "false"));

        // Update MediaSession metadata
        MediaMetadataCompat.Builder metadata = new MediaMetadataCompat.Builder()
            .putString(MediaMetadataCompat.METADATA_KEY_TITLE, currentTitle)
            .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, currentArtist)
            .putString(MediaMetadataCompat.METADATA_KEY_ALBUM, "Lorapok Player");

        String durationStr = prefs.getString("media_duration", "0");
        try {
            long duration = Long.parseLong(durationStr);
            metadata.putLong(MediaMetadataCompat.METADATA_KEY_DURATION, duration);
        } catch (NumberFormatException ignored) {}

        mediaSession.setMetadata(metadata.build());
        updatePlaybackState();
    }

    private Notification buildNotification() {
        Intent launchIntent = new Intent(this, MainActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
            this, 0, launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // Build action intents
        PendingIntent prevIntent  = buildActionIntent(ACTION_PREV, 1);
        PendingIntent playIntent  = buildActionIntent(isPlaying ? ACTION_PAUSE : ACTION_PLAY, 2);
        PendingIntent nextIntent  = buildActionIntent(ACTION_NEXT, 3);
        PendingIntent stopIntent  = buildActionIntent(ACTION_STOP, 4);

        Bitmap largeIcon = BitmapFactory.decodeResource(getResources(), R.mipmap.ic_launcher);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setLargeIcon(largeIcon)
            .setContentTitle(currentTitle)
            .setContentText(currentArtist)
            .setContentIntent(contentIntent)
            .setDeleteIntent(stopIntent)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(isPlaying)
            .addAction(android.R.drawable.ic_media_previous, "Previous", prevIntent)
            .addAction(
                isPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play,
                isPlaying ? "Pause" : "Play",
                playIntent
            )
            .addAction(android.R.drawable.ic_media_next, "Next", nextIntent)
            .setStyle(new MediaStyle()
                .setMediaSession(mediaSession.getSessionToken())
                .setShowActionsInCompactView(0, 1, 2)
            );

        return builder.build();
    }

    private PendingIntent buildActionIntent(String action, int requestCode) {
        Intent intent = new Intent(this, MediaPlaybackService.class);
        intent.setAction(action);
        return PendingIntent.getService(
            this, requestCode, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private void updateNotification() {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) {
            nm.notify(NOTIFICATION_ID, buildNotification());
        }
    }

    private void broadcastStateToWeb(String command) {
        // Write the command to SharedPreferences so the Capacitor web layer can pick it up
        SharedPreferences prefs = getSharedPreferences("group.lorapok.widget", MODE_PRIVATE);
        prefs.edit().putString("native_command", command)
                    .putLong("native_command_ts", System.currentTimeMillis())
                    .apply();
    }
}
